#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareAnsi } from '../docs/components/ansiReplay.ts';
import { applyInkAlignedUnicode } from '../docs/components/xtermUnicode.ts';
import symbols from '../src/styles/symbols.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const require = createRequire(path.join(packageRoot, 'package.json'));
const inkReq = createRequire(require.resolve('ink'));
const stringWidth = (() => {
  const m = inkReq('string-width');
  return typeof m === 'function' ? m : m.default;
})();
const headlessMod = require('@xterm/headless');

const Terminal = headlessMod.Terminal || headlessMod.default?.Terminal || headlessMod.default;

const results = [];
const pass = (n, d = {}) => results.push({ test: n, ok: true, ...d });
const fail = (n, d = {}) => results.push({ test: n, ok: false, ...d });

function cps(s) {
  return [...s].map((ch) => 'U+' + ch.codePointAt(0).toString(16).toUpperCase().padStart(4, '0'));
}

function runCapture(absFile) {
  return new Promise((resolve, reject) => {
    const tsx = require.resolve('tsx');
    const runner = path.join(__dirname, 'run-capture-worker.mjs');
    const child = spawn(process.execPath, ['--import', tsx, runner, absFile], {
      cwd: packageRoot,
      env: { ...process.env, FORCE_COLOR: '3', COLORTERM: 'truecolor', TERM: 'xterm-256color' },
    });
    let out = Buffer.alloc(0);
    let err = Buffer.alloc(0);
    child.stdout.on('data', (c) => {
      out = Buffer.concat([out, c]);
    });
    child.stderr.on('data', (c) => {
      err = Buffer.concat([err, c]);
    });
    // capture merges stderr too? worker may only forward stdout — alert writes warn/error to stderr
    child.on('close', (code) => {
      const text = Buffer.concat([out, err]).toString('utf8');
      if (code !== 0 && !text) reject(new Error(err.toString() || String(code)));
      else resolve(text);
    });
  });
}

// Symbol contract
if (symbols.warning !== '▲')
  fail('symbols-warning-triangle', { got: symbols.warning, cps: cps(symbols.warning) });
else pass('symbols-warning-triangle', { cps: cps(symbols.warning) });
if (symbols.warning.includes('\u26A0') || symbols.warning.includes('\uFE0F'))
  fail('symbols-warning-no-26A0');
else pass('symbols-warning-no-26A0');

for (const [name, ch] of [
  ['warning', symbols.warning],
  ['error', symbols.error],
  ['active', symbols.active],
  ['done', symbols.done],
]) {
  const term = new Terminal({ cols: 20, rows: 2, allowProposedApi: true });
  applyInkAlignedUnicode(term);
  await new Promise((r) => term.write('\x1B[H\x1B[2J' + ch, r));
  const sw = stringWidth(ch);
  const cx = term.buffer.active.cursorX;
  if (sw !== 1 || cx !== 1) fail('icon-width-' + name, { ch, sw, cx, cps: cps(ch) });
  else pass('icon-width-' + name, { ch, sw, cx, cps: cps(ch) });
}

// Panel status capture: 4 corners, no ⚠, last line └, no scroll clip with content-sized rows
{
  const ansi = await runCapture(path.join(packageRoot, 'src/Panel/demos/status.tsx'));
  if (ansi.includes('\u26A0') || ansi.includes('⚠'))
    fail('panel-ansi-no-warning-sign', { snip: ansi.slice(0, 200) });
  else pass('panel-ansi-no-warning-sign');
  if (!ansi.includes('▲')) fail('panel-ansi-has-triangle');
  else pass('panel-ansi-has-triangle');
  const prepared = prepareAnsi(ansi);
  // eslint-disable-next-line no-control-regex, regexp/no-obscure-range -- Match ANSI CSI/OSC protocol byte ranges, not human text.
  const visible = prepared.replaceAll(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, '').replaceAll('\r', '');
  const lines = visible.split('\n');
  while (lines.length && lines.at(-1) === '') lines.pop();
  const corners = lines.filter((l) => l.includes('└'));
  if (corners.length !== 4) fail('panel-four-corners-raw', { count: corners.length, lines });
  else pass('panel-four-corners-raw', { count: 4 });
  if (!(lines.at(-1) || '').includes('└')) fail('panel-last-line-corner', { last: lines.at(-1) });
  else pass('panel-last-line-corner');

  const cols = 48;
  // Probe with tall terminal, then paint at fitted rows (content + cursor), matching plugin measureAnsi.
  const probe = new Terminal({
    cols,
    rows: 40,
    scrollback: 0,
    allowProposedApi: true,
    convertEol: true,
  });
  applyInkAlignedUnicode(probe);
  await new Promise((r) => probe.write(prepared, r));
  let used = 0;
  for (let y = 0; y < probe.buffer.active.length; y++) {
    const line = (probe.buffer.active.getLine(y)?.translateToString(true) ?? '').replace(
      /\s+$/,
      '',
    );
    if (line) used = y + 1;
  }
  const fitted = Math.max(used, probe.buffer.active.cursorY + 1, lines.length);
  const term = new Terminal({
    cols,
    rows: fitted,
    scrollback: 0,
    allowProposedApi: true,
    convertEol: true,
  });
  applyInkAlignedUnicode(term);
  await new Promise((r) => term.write(prepared, r));
  const painted = [];
  for (let y = 0; y < term.buffer.active.length; y++) {
    painted.push(
      (term.buffer.active.getLine(y)?.translateToString(true) ?? '').replace(/\s+$/, ''),
    );
  }
  while (painted.length && !painted.at(-1)) painted.pop();
  const first = painted.find((l) => l.includes('Active') || l.includes('◆'));
  const last = painted.at(-1) || '';
  if (!first) fail('panel-no-scroll-keeps-first', { painted, fitted });
  else pass('panel-no-scroll-keeps-first', { first, fitted });
  if (!last.includes('└')) fail('panel-no-clip-keeps-last-corner', { last, painted });
  else pass('panel-no-clip-keeps-last-corner', { last });
  const paintedCorners = painted.filter((l) => l.includes('└'));
  if (paintedCorners.length !== 4)
    fail('panel-painted-four-corners', { count: paintedCorners.length, painted });
  else pass('panel-painted-four-corners');
}

// Alert capture icons + width + message emoji preserved
{
  const ansi = await runCapture(path.join(packageRoot, 'src/alert/demos/index.tsx'));
  const combined = ansi;
  if (combined.includes('\u26A0') || combined.includes('\u2714') || combined.includes('\u2139')) {
    fail('alert-no-consola-emoji-icons', { snip: combined });
  } else pass('alert-no-consola-emoji-icons');
  for (const ch of ['✓', '●', '▲', '▲']) {
    if (!combined.includes(ch)) fail('alert-has-icon-' + ch, { snip: combined });
    else pass('alert-has-icon-' + ch);
  }
  /* eslint-disable no-control-regex, regexp/no-obscure-range -- Strip ANSI CSI protocol byte ranges in the regression assertion. */
  const strip = (s) => s.replaceAll(/\x1B\[[0-9;?]*[ -/]*[@-~]/g, '').replaceAll('\r', '');
  /* eslint-enable no-control-regex, regexp/no-obscure-range */
  const lines = strip(combined)
    .split('\n')
    .map((l) => l.trimEnd())
    .filter((l) => l);
  for (const line of lines) {
    const term = new Terminal({ cols: 40, rows: 2, allowProposedApi: true });
    applyInkAlignedUnicode(term);
    await new Promise((r) => term.write('\x1B[H\x1B[2J' + line, r));
    const sw = stringWidth(line);
    const cx = term.buffer.active.cursorX;
    if (sw !== cx) fail('alert-line-width', { line, sw, cx, cps: cps(line.slice(0, 3)) });
    else pass('alert-line-width', { line, sw, cx });
  }
}

// Message emoji preserved: unit-level write through demo isn't enough — call alert API with emoji
{
  const { default: alert } = await import('../src/alert/index.ts');
  let buf = '';
  const orig = process.stdout.write;
  process.stdout.write = (chunk) => {
    buf += String(chunk);
    return true;
  };
  try {
    alert.success('done ✨ feat');
  } finally {
    process.stdout.write = orig;
  }
  if (!buf.includes('✨')) fail('alert-preserves-message-emoji', { buf });
  else pass('alert-preserves-message-emoji', { buf: buf.trim() });
  if (buf.includes('✓')) pass('alert-success-icon-checkmark');
  else fail('alert-success-icon-checkmark', { buf });
}

console.log(JSON.stringify(results, null, 2));
const bad = results.filter((r) => !r.ok);
if (bad.length) {
  console.error('FAIL', bad);
  process.exit(1);
}
console.log('OK alert-panel-symbols');
