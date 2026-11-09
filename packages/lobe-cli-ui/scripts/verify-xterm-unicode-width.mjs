#!/usr/bin/env node
/**
 * Headless: xterm column widths must match Ink's string-width for docs demos.
 * Provider: @xterm/addon-unicode-graphemes → activeVersion "15-graphemes".
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { createElement } from 'react';

import { applyInkAlignedUnicode, XTERM_UNICODE_VERSION } from '../docs/components/xtermUnicode.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(__dirname, '..');
const require = createRequire(path.join(packageRoot, 'package.json'));
const inkReq = createRequire(require.resolve('ink'));
const stringWidth = inkReq('string-width').default || inkReq('string-width');
const headlessMod = require('@xterm/headless');

const Terminal = headlessMod.Terminal || headlessMod.default?.Terminal || headlessMod.default;
if (typeof Terminal !== 'function') {
  throw new Error(
    'Cannot resolve @xterm/headless Terminal export: ' +
      JSON.stringify(Object.keys(headlessMod || {})),
  );
}

const results = [];
const pass = (n, d = {}) => results.push({ test: n, ok: true, ...d });
const fail = (n, d = {}) => results.push({ test: n, ok: false, ...d });

const samples = [
  'a',
  '中',
  '✨',
  '🐛',
  '♻️',
  '📝',
  '🤯',
  '🖋️',
  '👨‍👩‍👧‍👦',
  '🏳️‍🌈',
  '🇺🇸',
  '✨ feat',
  '♻️ refactor',
  '❯ ✨ feat  A new feature',
  '  🐛 fix  A bug fix',
  '  ♻️ refactor  A code change',
  '  📝 docs  Documentation only',
];

{
  const term = new Terminal({ cols: 80, rows: 4, allowProposedApi: true });
  applyInkAlignedUnicode(term);
  if (term.unicode.activeVersion !== XTERM_UNICODE_VERSION) {
    fail('active-version', { got: term.unicode.activeVersion });
  } else pass('active-version', { version: term.unicode.activeVersion });

  let bad = [];
  for (const s of samples) {
    await new Promise((r) => term.write('\x1B[H\x1B[2J' + s, r));
    const sw = stringWidth(s);
    const cx = term.buffer.active.cursorX;
    if (sw !== cx) bad.push({ s, sw, cx });
  }
  if (bad.length) fail('cursor-vs-string-width', { bad });
  else pass('cursor-vs-string-width', { n: samples.length });
}

// Capture real SelectInput ANSI and compare buffer layout of first data line widths
{
  const { createTtyStdout, createTtyStdin, withPatchedStdio } = await import('./ink-tty.mjs');
  const { stdout, read } = createTtyStdout(80, 12);
  const stdin = createTtyStdin();
  await withPatchedStdio(stdout, stdin, async () => {
    const mod = await import(`../src/SelectInput/demos/index.tsx?w=${Date.now()}`);
    const { render } = await import('ink');
    const inst = render(createElement(mod.default), { stdout, stdin, patchConsole: false });
    await new Promise((r) => setTimeout(r, 80));
    inst.unmount();
  });
  const ansi = read();
  const term = new Terminal({ cols: 80, rows: 12, allowProposedApi: true });
  applyInkAlignedUnicode(term);
  await new Promise((r) => term.write(ansi.replaceAll('\n', '\r\n'), r));
  const lines = [];
  for (let y = 0; y < term.rows; y++) {
    const raw = term.buffer.active.getLine(y)?.translateToString(true) ?? '';
    lines.push(raw.replace(/\s+$/, ''));
  }
  while (lines.length && !lines.at(-1)) lines.pop();
  const joined = lines.join('\n');
  const hasFeat = /✨.*feat|feat/.test(joined);
  const hasFix = /🐛|fix/.test(joined);
  // No obvious double-space collapse from narrow emoji: cursor layout — check feat line starts with ❯
  const featLine = lines.find((l) => /feat/.test(l)) || '';
  const ok = hasFeat && hasFix && featLine.includes('❯');
  if (!ok) fail('selectinput-buffer', { lines });
  else pass('selectinput-buffer', { lines: lines.slice(0, 5) });
}

const out = '/tmp/xterm-unicode-width-results.json';
fs.writeFileSync(out, JSON.stringify(results, null, 2));
try {
  fs.mkdirSync('/mnt/c/Users/Administrator/Downloads/ink-live-verify', { recursive: true });
  fs.copyFileSync(
    out,
    '/mnt/c/Users/Administrator/Downloads/ink-live-verify/xterm-unicode-width-results.json',
  );
} catch {
  /* ignore */
}
const ok = results.every((r) => r.ok);
console.log(JSON.stringify(results, null, 2));
console.log(ok ? `OK unicode width -> ${out}` : `FAIL unicode width -> ${out}`);
process.exit(ok ? 0 : 1);
