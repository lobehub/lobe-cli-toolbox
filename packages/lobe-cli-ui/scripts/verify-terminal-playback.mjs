#!/usr/bin/env node
/** Same controller as the browser, REAL browser xterm model + headless display.
 * No browser automation. Captures all registry demos afresh through the plugin.
 * Run: node --import tsx scripts/verify-terminal-playback.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareAnsi } from '../docs/components/ansiReplay.ts';
import { createTerminalPlayback, writeAndWait } from '../docs/components/terminalPlayback.ts';
import { applyInkAlignedUnicode } from '../docs/components/xtermUnicode.ts';
import { DEMO_REGISTRY } from './ink-demo-registry.mjs';
import { inkDemoPlugin } from './vite-ink-demo-plugin.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { Terminal } = require('@xterm/headless');
const { Terminal: BrowserTerminal } = require('@xterm/xterm');

const results = [];
const plugin = inkDemoPlugin();
const options = { allowProposedApi: true, cols: 80, rows: 24, scrollback: 1000, convertEol: true };
const make = (Ctor = Terminal, extra = {}) => {
  const term = new Ctor({ ...options, ...extra });
  applyInkAlignedUnicode(term);
  return term;
};
function lines(term) {
  const b = term.buffer.active;
  const a = Array.from({ length: b.length }, (_, y) =>
    (b.getLine(y)?.translateToString(true) || '').trimEnd(),
  );
  while (a.length && !a.at(-1).trim()) a.pop();
  return a;
}

// Independently demonstrate the ORIGINAL race rather than merely source-string checks.
{
  const broken = make(Terminal, { rows: 8, scrollback: 0 });
  const done = writeAndWait(broken, 'top\r\ncontent\r\nbottom');
  assert.equal(lines(broken).length, 0);
  broken.resize(80, 1);
  await done;
  assert.deepEqual(lines(broken), ['bottom']);
  broken.dispose();
  results.push({ test: 'original-race-reproduced', ok: true });
}
// Browser and Node entry points cannot silently diverge again.
{
  const nodeHelpers = await import('../docs/components/ansiReplay.mjs');
  assert.equal(nodeHelpers.prepareAnsi, prepareAnsi);
  assert.equal(prepareAnsi('a\r\nb\n'), 'a\r\nb\r\n');
}

const expected = {
  'Panel/index': ['Commit type', 'Pick a gitmoji', 'enter', 'esc'],
  'KeyHints/index': ['enter', 'confirm', 'esc', 'back', '↑↓', 'move'],
  'alert/index': ['Committed', 'Nothing to do', 'Using fallback model', 'Missing API key'],
};

for (const entry of Object.values(DEMO_REGISTRY)) {
  const abs = path.join(root, entry.file);
  const transformed = await plugin.transform.call({}, fs.readFileSync(abs, 'utf8'), abs, {
    ssr: false,
  });
  assert.ok(transformed?.code.includes('LiveInkTerminal'), entry.id + ' must be transformed');
  const frames = JSON.parse(transformed.code.match(/const FRAMES = (.*);/)[1]);
  const cols = Number(transformed.code.match(/cols=\{(\d+)\}/)[1]);
  const rows = Number(transformed.code.match(/rows=\{(\d+)\}/)[1]);
  assert.equal(cols, 80, 'protocol width must match capture TTY');
  const model = make(BrowserTerminal, { cols, rows });
  const view = make(Terminal, { cols: 2, rows: 1, scrollback: 0 });
  const snapshots = [];
  const playback = createTerminalPlayback(model, view, (s) => snapshots.push(s));
  const reference = make(Terminal, { cols, rows });
  const baselines = [];
  for (const frame of frames) {
    reference.reset();
    await writeAndWait(reference, prepareAnsi(frame.ansi));
    baselines.push(lines(reference));
  }
  const cycles = entry.animated ? 3 : 1;
  for (let cycle = 0; cycle < cycles; cycle++) {
    for (let i = 0; i < frames.length; i++) {
      await playback.replay(frames[i].ansi, i === 0);
      assert.deepEqual(lines(view), baselines[i], `${entry.id} frame ${i} cycle ${cycle}`);
      assert.equal(
        view.rows,
        Math.max(1, baselines[i].length),
        'no protocol padding in visible height',
      );
      if (entry.id === 'TaskList/index') {
        const zh = lines(view).filter((line) => line.includes('locales/zh-CN.json'));
        assert.ok(zh.length <= 1, 'no duplicate zh task after any frame/loop');
        if (zh.length)
          assert.match(lines(view).join('\n'), /locales\/en\.json/, 'completed en persists');
      }
    }
  }
  const texts = snapshots.map((x) => x.text.join('\n'));
  assert.ok(
    texts.every((x) => x.trim()),
    entry.id + ' must never disappear',
  );
  if (entry.animated) assert.ok(new Set(texts).size >= 2, entry.id + ' must really animate');
  if (entry.id === 'Panel/status') {
    const output = lines(view);
    assert.equal(output.filter((x) => x.includes('└')).length, 4);
    assert.match(output.at(-1), /└/);
    const warning = output.findIndex((x) => x.includes('Warning step'));
    const error = output.findIndex((x) => x.includes('Error step'));
    assert.ok(output[warning].startsWith('▲') && output[error].startsWith('▲'));
    assert.notEqual(
      view.buffer.active.getLine(warning).getCell(0).getFgColor(),
      view.buffer.active.getLine(error).getCell(0).getFgColor(),
      'same triangle, different warning/error colors',
    );
  }
  if (entry.id === 'alert/index') {
    const output = lines(view);
    assert.ok(output[2].startsWith('▲') && output[3].startsWith('▲'));
    assert.notEqual(
      view.buffer.active.getLine(2).getCell(0).getFgColor(),
      view.buffer.active.getLine(3).getCell(0).getFgColor(),
    );
  }
  const all = texts.join('\n');
  for (const token of expected[entry.id] || [])
    assert.ok(all.includes(token), `${entry.id} missing ${token}`);
  if (entry.id === 'ProgressBar/index')
    assert.match(all, /100%/, 'capture covers completed progress');
  if (entry.id === 'TaskList/index')
    assert.match(all, /All locales updated/, 'capture covers final state');
  results.push({
    test: entry.id,
    ok: true,
    frames: frames.length,
    cycles,
    visibleRows: [...new Set(snapshots.map((x) => x.rows))],
    uniqueScreens: new Set(texts).size,
  });
  console.log(JSON.stringify(results.at(-1)));
  playback.dispose();
  model.dispose();
  view.dispose();
  reference.dispose();
}
// Rapid queued updates cannot read pre-write state or drop a frame.
{
  const model = make(BrowserTerminal),
    view = make(Terminal, { cols: 2, rows: 1, scrollback: 0 });
  const seen = [];
  const p = createTerminalPlayback(model, view, (s) => seen.push(s.text.join('\n')));
  await Promise.all(['one\n', 'two\n', 'three\n'].map((s) => p.replay(s, true)));
  assert.deepEqual(seen, ['one', 'two', 'three']);
  // Preserve RGB, background, bold and wide user glyphs; never replace emoji.
  await p.replay('\x1B[1;38;2;12;34;56;48;2;45;67;89m✓ 👩‍💻 ♻️\x1B[0m\n', true);
  const cell = view.buffer.active.getLine(0).getCell(0);
  assert.equal(cell.getFgColor(), 0x0C2238);
  assert.equal(cell.getBgColor(), 0x2D4359);
  assert.ok(cell.isBold());
  assert.match(lines(view).join(''), /👩\u200D💻 ♻️/);
  p.dispose();
  model.dispose();
  view.dispose();
  results.push({ test: 'queued-updates-and-style-unicode-roundtrip', ok: true });
}
// Runtime component dependencies erased from the transformed browser import
// graph must invalidate captures in Vite, not just on a manual server restart.
{
  const module = { id: path.join(root, 'src/Panel/demos/index.tsx') };
  let invalidated = 0;
  const changed = plugin.hotUpdate.call(
    {
      environment: {
        moduleGraph: {
          getModuleById: (id) => (id === module.id ? module : undefined),
          invalidateModule: () => {
            invalidated++;
          },
        },
      },
    },
    { file: path.join(root, 'src/styles/symbols.ts'), modules: [] },
  );
  assert.ok(changed.includes(module));
  assert.equal(invalidated, 1);
  const source = fs.readFileSync(path.join(root, 'docs/components/LiveInkTerminal.tsx'), 'utf8');
  assert.ok(!/style=\{\{[^}]*height/.test(source), 'host must not estimate pixel height');
  const css = fs.readFileSync(require.resolve('@xterm/xterm/css/xterm.css'), 'utf8');
  assert.match(css, /\.xterm \.xterm-screen\s*\{[^}]*position:\s*relative/);
  results.push({
    test: 'runtime-source-invalidates-capture-and-normal-flow-dom-contract',
    ok: true,
  });
}
const out = '/tmp/ink-terminal-playback-results.json';
fs.writeFileSync(out, JSON.stringify(results, null, 2));
console.log('PASS canonical playback all 14 demos; ' + out);
