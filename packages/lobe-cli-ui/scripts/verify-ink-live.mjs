#!/usr/bin/env node
/**
 * Non-browser verification for live Ink docs:
 * 1) Spinner frames change over time (real useAnimation)
 * 2) SelectInput down-arrow changes ANSI via live worker
 * 3) TextInput key changes ANSI via live worker
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const require = createRequire(path.join(packageRoot, 'package.json'));
const tsx = require.resolve('tsx');
const outDir = '/tmp/ink-live-verify';
fs.mkdirSync(outDir, { recursive: true });

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: packageRoot,
      env: { ...process.env, FORCE_COLOR: '3', COLORTERM: 'truecolor' },
      ...opts,
    });
    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    child.stdout?.on('data', (c) => {
      out = Buffer.concat([out, c]);
    });
    child.stderr?.on('data', (c) => {
      err = Buffer.concat([err, c]);
    });
    child.on('close', (code) => {
      if (code !== 0) reject(new Error(err.toString() || `exit ${code}`));
      else resolve(out.toString('utf8'));
    });
  });
}

/* eslint-disable no-control-regex, regexp/no-obscure-range -- This helper strips ANSI CSI/OSC protocol bytes from captured terminal output. */
function strip(ansi) {
  return ansi
    .replaceAll(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, '')
    .replaceAll(/\x1B\][^\x07]*(?:\x07|\x1B\\)/g, '');
}

/* eslint-enable no-control-regex, regexp/no-obscure-range */

function openWorker(demoId) {
  const child = spawn(
    process.execPath,
    ['--import', tsx, path.join(__dirname, 'ink-live-worker.mjs'), demoId],
    {
      cwd: packageRoot,
      env: { ...process.env, FORCE_COLOR: '3', COLORTERM: 'truecolor', TERM: 'xterm-256color' },
      stdio: ['pipe', 'pipe', 'pipe'],
    },
  );
  const state = { ansi: '', ready: false, events: [] };
  let buf = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i);
      buf = buf.slice(i + 1);
      if (!line.trim()) continue;
      const msg = JSON.parse(line);
      state.events.push(msg);
      if (msg.type === 'ready') state.ready = true;
      if (msg.type === 'ansi') {
        // Ink sends incremental updates; accumulate decode
        const chunkAnsi = Buffer.from(msg.data, 'base64').toString('utf8');
        state.ansi += chunkAnsi;
        state.lastChunk = chunkAnsi;
        state.lastPlain = strip(state.ansi);
      }
    }
  });
  const send = (obj) => child.stdin.write(JSON.stringify(obj) + '\n');
  const waitReady = async (ms = 3000) => {
    const t0 = Date.now();
    while (!state.ready && Date.now() - t0 < ms) await new Promise((r) => setTimeout(r, 20));
    if (!state.ready) throw new Error('worker not ready: ' + demoId);
  };
  const shutdown = () => {
    try {
      send({ type: 'exit' });
    } catch {}
    try {
      child.kill('SIGTERM');
    } catch {}
  };
  return { child, state, send, waitReady, shutdown };
}

const results = [];

// 1) Spinner frames
{
  const demo = path.join(packageRoot, 'src/Spinner/demos/index.tsx');
  const json = await run(process.execPath, [
    '--import',
    tsx,
    path.join(__dirname, 'capture-ink-frames-demo.mjs'),
    demo,
    '1000',
    '80',
  ]);
  const parsed = JSON.parse(json);
  fs.writeFileSync(path.join(outDir, 'spinner-frames.json'), JSON.stringify(parsed, null, 2));
  const plains = parsed.frames.map((f) => strip(f.ansi));
  const unique = new Set(plains);
  const ok = parsed.frames.length >= 3 && unique.size >= 2;
  results.push({
    test: 'spinner-frames',
    ok,
    frames: parsed.frames.length,
    unique: unique.size,
    sample: plains.slice(0, 4),
  });
  if (!ok) throw new Error('spinner frames did not change');
}

// 2) SelectInput interactive via worker
{
  const w = openWorker('SelectInput/index');
  await w.waitReady();
  await new Promise((r) => setTimeout(r, 200));
  const before = strip(w.state.ansi);
  w.send({ type: 'key', data: '\u001B[B' }); // down
  await new Promise((r) => setTimeout(r, 250));
  w.send({ type: 'key', data: '\u001B[B' });
  await new Promise((r) => setTimeout(r, 250));
  const after = strip(w.state.ansi);
  fs.writeFileSync(path.join(outDir, 'select-before.txt'), before);
  fs.writeFileSync(path.join(outDir, 'select-after.txt'), after);
  const moved = before !== after && /fix|refactor|feat/.test(after);
  results.push({
    test: 'select-down',
    ok: moved,
    before: before.slice(0, 120),
    after: after.slice(0, 120),
  });
  w.shutdown();
  if (!moved) throw new Error('SelectInput did not change after arrow keys');
}

// 3) TextInput typing
{
  const w = openWorker('TextInput/index');
  await w.waitReady();
  await new Promise((r) => setTimeout(r, 200));
  const before = strip(w.state.ansi);
  for (const ch of '!') {
    w.send({ type: 'key', data: ch });
    await new Promise((r) => setTimeout(r, 40));
  }
  await new Promise((r) => setTimeout(r, 200));
  const after = strip(w.state.ansi);
  fs.writeFileSync(path.join(outDir, 'text-before.txt'), before);
  fs.writeFileSync(path.join(outDir, 'text-after.txt'), after);
  const changed = after.includes('!') || after !== before;
  results.push({
    test: 'text-input-key',
    ok: changed,
    before: before.slice(0, 80),
    after: after.slice(0, 80),
  });
  w.shutdown();
  if (!changed) throw new Error('TextInput did not change after key');
}

fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(results, null, 2));
console.log(JSON.stringify(results, null, 2));
console.log('OK verify ->', outDir);
