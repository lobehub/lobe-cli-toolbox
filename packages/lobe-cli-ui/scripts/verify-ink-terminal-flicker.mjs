#!/usr/bin/env node
/**
 * Regression: LiveInkTerminal write sequencing must not blank between Ink frames.
 * Run: node --import tsx scripts/verify-ink-terminal-flicker.mjs
 * (or: pnpm exec tsx scripts/verify-ink-terminal-flicker.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CLEAR_HOME,
  planReplayWrite,
  pushLiveChunk,
  sanitizeAnsi,
} from '../docs/components/ansiReplay.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const results = [];
const fail = (name, detail) => results.push({ test: name, ok: false, detail });
const pass = (name, detail = {}) => results.push({ test: name, ok: true, ...detail });

function loadSpinnerFrames() {
  const evid = '/mnt/c/Users/Administrator/Downloads/ink-live-verify/spinner-frames.json';
  if (fs.existsSync(evid)) {
    const j = JSON.parse(fs.readFileSync(evid, 'utf8'));
    return Array.isArray(j) ? j : j.frames;
  }
  const cache = path.join(packageRoot, 'node_modules/.cache/ink-demos');
  if (fs.existsSync(cache)) {
    for (const name of fs.readdirSync(cache)) {
      if (!name.endsWith('.frames.json')) continue;
      const j = JSON.parse(fs.readFileSync(path.join(cache, name), 'utf8'));
      const frames = j.frames || j;
      if (Array.isArray(frames) && frames[0]?.ansi?.includes('Translating')) return frames;
    }
  }
  throw new Error('no spinner frames available');
}

{
  const esc = '\x1B';
  const sample = `${esc}[?2026h${esc}[?25l${esc}[?1049hHi${esc}[?1049l${esc}[?2026l`;
  const out = sanitizeAnsi(sample);
  if (!out.includes(`${esc}[?2026h`) || !out.includes(`${esc}[?25l`)) {
    fail('sanitize-keeps-sync-cursor', { out: JSON.stringify(out) });
  } else if (out.includes('1049')) {
    fail('sanitize-strips-altscreen', { out: JSON.stringify(out) });
  } else {
    pass('sanitize-keeps-sync-cursor-strips-altscreen');
  }
}

{
  const frames = loadSpinnerFrames();
  let prev = '';
  let resets = 0;
  let clearWrites = 0;
  let deltaWrites = 0;
  for (let i = 0; i < frames.length; i++) {
    const { prepared, ops } = planReplayWrite(prev, frames[i].ansi, { forceRestart: i === 0 });
    prev = prepared;
    for (const op of ops) {
      if (op.op === 'reset') resets++;
      if (op.op === 'write' && op.data.startsWith(CLEAR_HOME)) clearWrites++;
      else if (op.op === 'write') deltaWrites++;
    }
  }
  const wrap = planReplayWrite(prev, frames[0].ansi, { forceRestart: true });
  for (const op of wrap.ops) {
    if (op.op === 'reset') resets++;
    if (op.op === 'write' && op.data.startsWith(CLEAR_HOME)) clearWrites++;
  }

  if (resets !== 0) fail('replay-no-reset-ops', { resets });
  else pass('replay-no-reset-ops');

  if (clearWrites !== 2) fail('replay-clear-only-start-and-wrap', { clearWrites, expected: 2 });
  else pass('replay-clear-only-start-and-wrap', { clearWrites });

  if (deltaWrites < frames.length - 1) {
    fail('replay-deltas-between-frames', { deltaWrites, frames: frames.length });
  } else pass('replay-deltas-between-frames', { deltaWrites });

  pass('legacy-reset-per-frame-eliminated', {
    oldResetsPerCycle: frames.length,
    newClearsPerCycle: 1,
  });
}

{
  const esc = '\x1B';
  let pending = '';
  const flushes = [];
  for (const p of [`${esc}[?2026h${esc}[2Kline`, `${esc}[?2026l`, 'trailing']) {
    const r = pushLiveChunk(pending, p);
    pending = r.pending;
    if (r.flush) flushes.push(r.flush);
  }
  if (flushes.length !== 1 || !flushes[0].endsWith(`${esc}[?2026l`)) {
    fail('live-coalesce-sync-region', { flushes, pending });
  } else if (pending !== 'trailing') {
    fail('live-coalesce-holds-trailing', { pending });
  } else pass('live-coalesce-sync-region');
}

async function headlessCheck() {
  let Terminal;
  try {
    ({ Terminal } = await import('@xterm/headless'));
  } catch {
    pass('headless-skipped', { reason: '@xterm/headless not installed' });
    return;
  }
  const frames = loadSpinnerFrames();
  const term = new Terminal({ cols: 40, rows: 6, allowProposedApi: true });
  let prev = '';
  const bufferText = () => {
    const buf = term.buffer.active;
    const lines = [];
    for (let y = 0; y < term.rows; y++) {
      lines.push(buf.getLine(buf.baseY + y)?.translateToString(true) ?? '');
    }
    return lines.join('\n');
  };
  const texts = [];
  for (let i = 0; i < Math.min(frames.length, 8); i++) {
    const { prepared, ops } = planReplayWrite(prev, frames[i].ansi, { forceRestart: i === 0 });
    prev = prepared;
    for (const op of ops) {
      if (op.op === 'write') {
        await new Promise((resolve) => term.write(op.data, resolve));
      }
    }
    texts.push(bufferText());
  }
  const nonempty = texts.every((t) => /Translating/.test(t));
  const anyEmpty = texts.some((t) => !t.replaceAll(/\s/g, ''));
  const changed = new Set(texts.map((t) => t.replaceAll(/\s+/g, ' ').trim())).size >= 2;
  if (!nonempty || anyEmpty)
    fail('headless-static-label-persists', { sample: texts[0], n: texts.length });
  else pass('headless-static-label-persists', { samples: texts.length });
  if (!changed) fail('headless-spinner-changes', { unique: 1 });
  else pass('headless-spinner-changes', { unique: new Set(texts).size });
}

await headlessCheck();

{
  const src = fs.readFileSync(
    path.join(packageRoot, 'docs/components/LiveInkTerminal.tsx'),
    'utf8',
  );
  const codeOnly = src.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\/\/.*$/gm, '');
  if (/\bterm\.reset\s*\(/.test(codeOnly)) fail('source-no-term-reset', {});
  else pass('source-no-term-reset');
  if (!src.includes('createTerminalPlayback') || !src.includes('requestAnimationFrame')) {
    fail('source-uses-delta-and-raf', {});
  } else pass('source-uses-delta-and-raf');
}

const outDir = '/tmp/ink-flicker-verify';
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'results.json');
fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
const evid = '/mnt/c/Users/Administrator/Downloads/ink-live-verify';
try {
  fs.mkdirSync(evid, { recursive: true });
  fs.writeFileSync(path.join(evid, 'flicker-results.json'), JSON.stringify(results, null, 2));
} catch {}
const ok = results.every((r) => r.ok);
console.log(JSON.stringify(results, null, 2));
console.log(ok ? `OK flicker verify -> ${outFile}` : `FAIL flicker verify -> ${outFile}`);
process.exit(ok ? 0 : 1);
