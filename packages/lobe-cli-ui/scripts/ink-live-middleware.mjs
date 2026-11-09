/**
 * Vite configureServer hook: attach /__ink-live WebSocket on the docs HTTP server.
 * Loopback Origin/Host only. Whitelisted demo IDs only. Spawns ink-live-worker per session.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { WebSocketServer } from 'ws';

import { resolveDemoId } from './ink-demo-registry.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const workerPath = path.join(__dirname, 'ink-live-worker.mjs');
const require = createRequire(path.join(packageRoot, 'package.json'));

const MAX_SESSIONS = 8;
let sessions = 0;

function isLoopbackHost(host) {
  if (!host) return false;
  const h = host.split(':')[0].toLowerCase();
  return h === '127.0.0.1' || h === 'localhost' || h === '[::1]' || h === '::1';
}

function originAllowed(origin, host) {
  if (!origin) return isLoopbackHost(host);
  try {
    const u = new URL(origin);
    return isLoopbackHost(u.hostname);
  } catch {
    return false;
  }
}

export function attachInkLiveServer(viteServer) {
  const httpServer = viteServer.httpServer;
  if (!httpServer) return;

  let tsxImport = 'tsx';
  try {
    tsxImport = require.resolve('tsx');
  } catch {}

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const url = new URL(req.url || '', 'http://127.0.0.1');
    if (url.pathname !== '/__ink-live') return;

    const host = req.headers.host || '';
    const origin = req.headers.origin || '';
    if (!isLoopbackHost(host) || !originAllowed(origin, host)) {
      socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    const demoId = url.searchParams.get('demo') || '';
    const entry = resolveDemoId(demoId);
    if (!entry) {
      socket.write('HTTP/1.1 404 Not Found\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }
    if (sessions >= MAX_SESSIONS) {
      socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      sessions += 1;
      const child = spawn(process.execPath, ['--import', tsxImport, workerPath, entry.id], {
        cwd: packageRoot,
        env: {
          ...process.env,
          FORCE_COLOR: '3',
          COLORTERM: 'truecolor',
          TERM: 'xterm-256color',
          CLI_UI_DOCS_LIVE: '1',
          INK_LIVE_COLS: url.searchParams.get('cols') || '80',
          INK_LIVE_ROWS: url.searchParams.get('rows') || '24',
        },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let killed = false;
      const killChild = () => {
        if (killed) return;
        killed = true;
        sessions = Math.max(0, sessions - 1);
        try {
          child.stdin.write(JSON.stringify({ type: 'exit' }) + '\n');
        } catch {}
        try {
          child.kill('SIGTERM');
        } catch {}
        setTimeout(() => {
          try {
            child.kill('SIGKILL');
          } catch {}
        }, 800);
      };

      child.stdout.setEncoding('utf8');
      let buf = '';
      child.stdout.on('data', (chunk) => {
        buf += chunk;
        let i;
        while ((i = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (!line.trim()) continue;
          if (ws.readyState === 1) ws.send(line);
        }
      });
      child.stderr.on('data', (c) => {
        // surface as error event, do not treat as ANSI
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: 'log', data: c.toString('utf8').slice(0, 500) }));
        }
      });
      child.on('exit', () => {
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'exit' }));
        killChild();
        try {
          ws.close();
        } catch {}
      });

      ws.on('message', (data) => {
        try {
          const msg = JSON.parse(String(data));
          if (msg.type === 'key' && typeof msg.data === 'string' && msg.data.length <= 32) {
            child.stdin.write(JSON.stringify({ type: 'key', data: msg.data }) + '\n');
          } else if (msg.type === 'exit') {
            killChild();
          }
        } catch {
          // ignore
        }
      });
      ws.on('close', killChild);
      ws.on('error', killChild);
    });
  });

  viteServer.httpServer?.on('close', () => {
    wss.close();
  });
}
