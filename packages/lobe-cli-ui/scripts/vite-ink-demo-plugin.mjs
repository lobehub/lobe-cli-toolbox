/**
 * Vite plugin: demos under src/.../demos/*.tsx keep on-disk source (docs-kit),
 * but the browser module is replaced with LiveInkTerminal:
 *  - animated demos get timestamped real Ink frames (static replay)
 *  - interactive demos get demoId for local /__ink-live WS (dev only)
 */
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { demoIdFromAbsPath, resolveDemoId } from './ink-demo-registry.mjs';
import { attachInkLiveServer } from './ink-live-middleware.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const captureRunner = path.join(__dirname, 'run-capture-worker.mjs');
const framesRunner = path.join(__dirname, 'capture-ink-frames-demo.mjs');
const cacheDir = path.join(packageRoot, 'node_modules', '.cache', 'ink-demos');

function captureDependencySalt() {
  // Hash ALL runtime component sources, not just the demo or a handpicked list.
  // A nested styles/layout dependency must invalidate its captured output too.
  const files = fs
    .readdirSync(path.join(packageRoot, 'src'), { recursive: true })
    .filter((rel) => /\.tsx?$/.test(rel) && !rel.includes('/demos/') && !rel.includes('.test.'))
    .map((rel) => `src/${rel}`);
  files.push(
    'docs/components/ansiReplay.ts',
    'docs/components/terminalPlayback.ts',
    'docs/components/xtermUnicode.ts',
    'scripts/capture-ink-frames-demo.mjs',
    'scripts/capture-ink-ansi.mjs',
    'scripts/run-capture-worker.mjs',
    'scripts/ink-tty.mjs',
  );
  return [
    'v8-screen-snapshots-serialized-writes',
    ...files.sort().map((rel) => rel + '\n' + fs.readFileSync(path.join(packageRoot, rel), 'utf8')),
  ].join('\n/*salt*/\n');
}

function isInkDemo(id, code) {
  const clean = id.split('?')[0].replaceAll('\\', '/');
  if (!clean.includes('/demos/') || !clean.endsWith('.tsx')) return false;
  if (clean.includes('/docs/')) return false;
  return (
    code.includes("from 'ink'") ||
    code.includes('from "ink"') ||
    code.includes("from '@lobehub/cli-ui'") ||
    code.includes('from "@lobehub/cli-ui"')
  );
}

const pkgRequire = createRequire(path.join(packageRoot, 'package.json'));

async function measureAnsi(ansi) {
  const { readScreen, writeAndWait } = await import('../docs/components/terminalPlayback.ts');
  const { applyInkAlignedUnicode } = await import('../docs/components/xtermUnicode.ts');
  const { prepareAnsi } = await import('../docs/components/ansiReplay.ts');
  const mod = pkgRequire('@xterm/headless');
  const term = new mod.Terminal({
    cols: 80,
    rows: 24,
    scrollback: 1000,
    allowProposedApi: true,
    convertEol: true,
  });
  applyInkAlignedUnicode(term);
  try {
    await writeAndWait(term, prepareAnsi(ansi));
    const screen = readScreen(term);
    // rows is protocol workspace, not UI height; the runtime derives UI from
    // the painted screen. Keep the trailing cursor landing row for Ink CUU.
    return { cols: 80, rows: Math.max(24, screen.rows + 1) };
  } finally {
    term.dispose();
  }
}

function resolveTsx() {
  try {
    return createRequire(path.join(packageRoot, 'package.json')).resolve('tsx');
  } catch {
    return 'tsx';
  }
}

function captureAnsi(absFile) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const src = fs.readFileSync(absFile, 'utf8');
  const hash = createHash('sha1')
    .update('v8|' + src + '|' + captureDependencySalt())
    .digest('hex')
    .slice(0, 16);
  const cacheFile = path.join(cacheDir, `${hash}.ansi`);
  if (fs.existsSync(cacheFile)) return fs.readFileSync(cacheFile, 'utf8');

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['--import', resolveTsx(), captureRunner, absFile], {
      cwd: packageRoot,
      env: {
        ...process.env,
        FORCE_COLOR: '3',
        COLORTERM: 'truecolor',
        TERM: process.env.TERM || 'xterm-256color',
        CLI_UI_DOCS_CAPTURE: '1',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    child.stdout.on('data', (c) => {
      out = Buffer.concat([out, c]);
    });
    child.stderr.on('data', (c) => {
      err = Buffer.concat([err, c]);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ink capture failed (${code}) for ${absFile}:\n${err.toString()}`));
        return;
      }
      const ansi = out.toString('utf8');
      fs.writeFileSync(cacheFile, ansi);
      resolve(ansi);
    });
  });
}

function captureFrames(absFile, durationMs = 900, intervalMs = 80) {
  fs.mkdirSync(cacheDir, { recursive: true });
  const src = fs.readFileSync(absFile, 'utf8');
  const hash = createHash('sha1')
    .update(`frames|v8|${durationMs}|${intervalMs}|${src}|${captureDependencySalt()}`)
    .digest('hex')
    .slice(0, 16);
  const cacheFile = path.join(cacheDir, `${hash}.frames.json`);
  if (fs.existsSync(cacheFile)) return JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', resolveTsx(), framesRunner, absFile, String(durationMs), String(intervalMs)],
      {
        cwd: packageRoot,
        env: {
          ...process.env,
          FORCE_COLOR: '3',
          COLORTERM: 'truecolor',
          TERM: process.env.TERM || 'xterm-256color',
          CLI_UI_DOCS_CAPTURE: '1',
        },
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    child.stdout.on('data', (c) => {
      out = Buffer.concat([out, c]);
    });
    child.stderr.on('data', (c) => {
      err = Buffer.concat([err, c]);
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ink frames failed (${code}) for ${absFile}:\n${err.toString()}`));
        return;
      }
      const parsed = JSON.parse(out.toString('utf8'));
      fs.writeFileSync(cacheFile, JSON.stringify(parsed));
      resolve(parsed);
    });
  });
}

export function inkDemoPlugin() {
  const transformedDemos = new Set();
  const titleFrom = (id) => {
    const parts = id.replaceAll('\\', '/').split('/');
    const i = parts.lastIndexOf('demos');
    const comp = i > 0 ? parts[i - 1] : 'demo';
    const file = parts.at(-1).replace(/\.tsx$/, '');
    return file === 'index' ? comp : `${comp}/${file}`;
  };

  return {
    name: 'lobe-cli-ui-ink-demo',
    hotUpdate({ file, modules }) {
      const relative = path.relative(packageRoot, file).replaceAll('\\', '/');
      const runtimeChanged =
        relative.startsWith('src/') &&
        !relative.includes('/demos/') &&
        !relative.includes('.test.');
      if (!runtimeChanged) return;
      // The browser module imports LiveInkTerminal instead of the original
      // component, so Vite cannot infer the erased runtime dependency itself.
      const affected = new Set(modules);
      for (const id of transformedDemos) {
        const module = this.environment.moduleGraph.getModuleById(id);
        if (!module) continue;
        this.environment.moduleGraph.invalidateModule(module);
        affected.add(module);
      }
      return [...affected];
    },
    enforce: 'pre',
    config() {
      return {
        optimizeDeps: {
          include: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-unicode-graphemes'],
        },
        server: {
          warmup: {
            clientFiles: [
              path.join(packageRoot, 'docs/components/LiveInkTerminal.tsx'),
              path.join(packageRoot, 'docs/components/XtermPreview.tsx'),
              path.join(packageRoot, 'src/**/demos/*.tsx'),
            ],
          },
        },
      };
    },
    configureServer(server) {
      attachInkLiveServer(server);
      const warm = async () => {
        for (const file of [
          path.join(packageRoot, 'docs/components/LiveInkTerminal.tsx'),
          path.join(packageRoot, 'src/Spinner/demos/index.tsx'),
          path.join(packageRoot, 'src/SelectInput/demos/index.tsx'),
          path.join(packageRoot, 'src/TextInput/demos/index.tsx'),
        ]) {
          if (!fs.existsSync(file)) continue;
          try {
            await server.transformRequest(file);
          } catch {
            /* warmup best-effort */
          }
        }
      };
      server.httpServer?.once('listening', () => {
        void warm();
      });
      setTimeout(() => void warm(), 500);
    },
    async transform(code, id, options) {
      // Prerender / SSR must not run Ink capture or inject browser LiveInkTerminal.
      if (options?.ssr) return;
      if (this.environment?.config?.consumer === 'server') return;
      if (id.includes('\0')) return;
      if (!isInkDemo(id, code)) return;
      transformedDemos.add(id);
      const abs = id.split('?')[0];
      const demoId = demoIdFromAbsPath(abs) || titleFrom(abs);
      const meta = resolveDemoId(demoId);
      const animated = !!meta?.animated;
      const interactive = !!meta?.interactive;

      let frames;
      let ansi;
      if (animated) {
        // Per-demo wall time: TaskList script is ~6s readable progression; Spinner stays short.
        // Interval 100ms bounds frame JSON size while keeping spinner/progress motion.
        let durationMs = 1200;
        let intervalMs = 80;
        if (demoId.startsWith('Spinner')) {
          durationMs = 1000;
          intervalMs = 80;
        } else if (demoId.startsWith('ProgressBar')) {
          durationMs = 2600;
          intervalMs = 100;
        } else if (demoId.startsWith('OptionList')) {
          durationMs = 1600;
          intervalMs = 100;
        } else if (demoId.startsWith('TaskList')) {
          durationMs = 7000;
          intervalMs = 100;
        }
        const captured = await captureFrames(abs, durationMs, intervalMs);
        frames = captured.frames || [];
        ansi = frames[0]?.ansi || '';
      } else {
        ansi = await captureAnsi(abs);
        frames = [{ t: 0, ansi }];
      }

      const sample = ansi || frames[0]?.ansi || '';
      let colsRows = await measureAnsi(sample);
      if (animated && frames.length > 1) {
        for (const fr of frames) {
          const m = await measureAnsi(fr.ansi || '');
          colsRows = {
            cols: Math.max(colsRows.cols, m.cols),
            rows: Math.max(colsRows.rows, m.rows),
          };
        }
      }
      const { cols, rows } = colsRows;
      const title = titleFrom(abs);
      const previewPath = path
        .relative(path.dirname(abs), path.join(packageRoot, 'docs/components/LiveInkTerminal.tsx'))
        .replaceAll('\\', '/');
      const importPath = previewPath.startsWith('.') ? previewPath : `./${previewPath}`;

      const next = `import LiveInkTerminal from '${importPath}';

const FRAMES = ${JSON.stringify(frames)};
const ANSI = ${JSON.stringify(ansi)};

export default function InkLiveDemoPreview() {
  return (
    <LiveInkTerminal
      ansi={ANSI}
      cols={${cols}}
      demoId={${JSON.stringify(demoId)}}
      frames={FRAMES}
      interactive={${interactive ? 'true' : 'false'}}
      rows={${Math.max(rows, interactive ? 6 : rows)}}
      title={${JSON.stringify(title)}}
    />
  );
}
`;
      return { code: next, map: null };
    },
  };
}
