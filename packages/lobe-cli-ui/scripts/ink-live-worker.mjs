/**
 * Controlled Ink demo worker — ONE whitelisted demo by id.
 * Protocol NDJSON on FD1 via writeProtocol (not Ink-patched stdout).
 * ANSI chunks are coalesced to complete ?2026 sync regions when possible
 * so the browser does not paint erase/redraw across separate WS messages.
 *
 * Async script demos (TaskList/alert) are awaited directly — they own ink.render.
 */
import { pathToFileURL } from 'node:url';

import { createElement } from 'react';

import { resolveDemoId } from './ink-demo-registry.mjs';
import { createTtyStdin, createTtyStdout, withPatchedStdio, writeProtocol } from './ink-tty.mjs';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const demoId = process.argv[2];
const entry = resolveDemoId(demoId);
if (!entry) {
  writeProtocol(JSON.stringify({ type: 'error', message: `demo not allowed: ${demoId}` }) + '\n');
  process.exit(2);
}

process.env.FORCE_COLOR = '3';
process.env.COLORTERM = 'truecolor';
process.env.TERM = process.env.TERM || 'xterm-256color';
process.env.CLI_UI_DOCS_LIVE = '1';

const cols = Number(process.env.INK_LIVE_COLS || 80);
const rows = Number(process.env.INK_LIVE_ROWS || 24);
const { stdout, drainChunks } = createTtyStdout(cols, rows);
const stdin = createTtyStdin();

function send(obj) {
  writeProtocol(JSON.stringify(obj) + '\n');
}

const SYNC_END = Buffer.from('\x1B[?2026l');
let coalesceBuf = Buffer.alloc(0);
let lastChunkAt = 0;

function emitAnsi(buf) {
  if (!buf.length) return;
  send({ type: 'ansi', t: Date.now(), data: buf.toString('base64') });
}

function flushAnsi(force = false) {
  for (const chunk of drainChunks()) {
    coalesceBuf = Buffer.concat([coalesceBuf, chunk.data]);
    lastChunkAt = Date.now();
  }
  if (!coalesceBuf.length) return;

  for (;;) {
    const idx = coalesceBuf.indexOf(SYNC_END);
    if (idx < 0) break;
    const cut = idx + SYNC_END.length;
    emitAnsi(coalesceBuf.subarray(0, cut));
    coalesceBuf = Buffer.from(coalesceBuf.subarray(cut));
  }

  const idleMs = Date.now() - lastChunkAt;
  if (force || (coalesceBuf.length && idleMs >= 24)) {
    emitAnsi(coalesceBuf);
    coalesceBuf = Buffer.alloc(0);
  }
}

const flushTimer = setInterval(() => flushAnsi(false), 16);

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  buffer += chunk;
  let idx;
  while ((idx = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, idx);
    buffer = buffer.slice(idx + 1);
    if (!line.trim()) continue;
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      continue;
    }
    if (msg.type === 'key' && typeof msg.data === 'string') stdin.write(msg.data);
    else if (msg.type === 'exit') cleanup(0);
  }
});

let instance = null;
let cleaned = false;
async function cleanup(code = 0) {
  if (cleaned) return;
  cleaned = true;
  clearInterval(flushTimer);
  flushAnsi(true);
  try {
    instance?.unmount?.();
  } catch {
    /* ignore */
  }
  process.exit(code);
}
process.on('SIGTERM', () => cleanup(0));
process.on('SIGINT', () => cleanup(0));

await withPatchedStdio(stdout, stdin, async () => {
  const mod = await import(`${pathToFileURL(entry.absPath).href}?live=${Date.now()}`);
  const Demo = mod.default;
  if (typeof Demo !== 'function') {
    send({ type: 'error', message: 'demo must default-export a component' });
    await cleanup(1);
    return;
  }

  if (Demo instanceof AsyncFunction) {
    send({ type: 'ready', demoId: entry.id, mode: 'ink-script', interactive: false });
    flushAnsi(true);
    try {
      await Demo();
    } catch (e) {
      send({ type: 'error', message: String(e?.message || e) });
    }
    flushAnsi(true);
    await cleanup(0);
    return;
  }

  const { render: inkRender } = await import('ink');
  instance = inkRender(createElement(Demo), { stdout, stdin, patchConsole: false });
  send({ type: 'ready', demoId: entry.id, mode: 'ink', interactive: !!entry.interactive });
  flushAnsi(true);
});
