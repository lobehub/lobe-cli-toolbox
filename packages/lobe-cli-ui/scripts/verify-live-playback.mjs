#!/usr/bin/env node
/** Real localhost WS + real Ink worker + SAME playback/controller as browser.
 * No DOM/browser automation. Run node --import tsx scripts/verify-live-playback.mjs
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createRequire } from 'node:module';

import WebSocket from 'ws';

import { createTerminalPlayback } from '../docs/components/terminalPlayback.ts';
import { applyInkAlignedUnicode } from '../docs/components/xtermUnicode.ts';

const require = createRequire(import.meta.url);
const { Terminal } = require('@xterm/headless');
const { Terminal: BrowserTerminal } = require('@xterm/xterm');

const results = [];
async function session(id, test) {
  const model = new BrowserTerminal({
    cols: 80,
    rows: 24,
    scrollback: 1000,
    allowProposedApi: true,
    convertEol: true,
  });
  const view = new Terminal({
    cols: 2,
    rows: 1,
    scrollback: 0,
    allowProposedApi: true,
    convertEol: true,
  });
  applyInkAlignedUnicode(model);
  applyInkAlignedUnicode(view);
  let text = '';
  let screen;
  let count = 0;
  let ready = false;
  let error;
  const history = [];
  const player = createTerminalPlayback(model, view, (s) => {
    screen = s;
    text = s.text.join('\n');
    count++;
    history.push(text);
    assert.equal(view.rows, s.rows);
    const lines = Array.from(
      { length: view.rows },
      (_, y) => view.buffer.active.getLine(y)?.translateToString(true).trimEnd() || '',
    );
    assert.deepEqual(
      lines,
      s.text.map((x) => x.trimEnd()),
    );
  });
  const ws = new WebSocket(
    `ws://localhost:5173/__ink-live?demo=${encodeURIComponent(id)}&cols=80&rows=24`,
    { origin: 'http://localhost:5173' },
  );
  ws.on('error', (e) => {
    error = e;
  });
  ws.on('message', (raw) => {
    const m = JSON.parse(String(raw));
    if (m.type === 'ready') ready = true;
    if (m.type === 'error') error = new Error(m.message);
    if (m.type === 'ansi')
      void player.live(Buffer.from(m.data, 'base64').toString('utf8')).catch((e) => {
        error = e;
      });
  });
  const wait = async (predicate, label) => {
    const until = Date.now() + 7000;
    while (Date.now() < until) {
      if (error) throw error;
      if (predicate()) return;
      await new Promise((r) => setTimeout(r, 25));
    }
    throw new Error(id + ' timed out ' + label + '; screen=' + text);
  };
  const key = (data) => ws.send(JSON.stringify({ type: 'key', data }));
  try {
    await wait(() => ready && count > 0, 'initial render');
    const initial = text;
    await test({ key, wait, text: () => text, screen: () => screen, history });
    results.push({
      test: id,
      ok: true,
      frames: count,
      initial,
      final: text,
      visibleRows: screen.rows,
    });
    console.log(JSON.stringify(results.at(-1)));
  } finally {
    if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'exit' }));
    ws.close();
    player.dispose();
    model.dispose();
    view.dispose();
  }
}
await session('SelectInput/index', async ({ key, wait, text }) => {
  assert.match(text(), /feat/);
  key('\x1B[B');
  await wait(() => /❯.*fix/.test(text()), 'down selects fix');
  assert.match(text(), /refactor/);
});
await session('TextInput/index', async ({ key, wait, text }) => {
  key('!');
  await wait(() => text().includes('!'), 'typed exclamation');
  key('\x7F');
  await wait(() => !text().includes('!'), 'backspace');
});
await session('TextInput/field', async ({ key, wait, text }) => {
  key('hello');
  await wait(() => text().includes('hello'), 'field typing');
  assert.match(text(), /72 characters/);
});
await session('SearchSelect/index', async ({ key, wait, text }) => {
  key('gpt');
  await wait(() => text().includes('gpt') && !text().includes('claude-sonnet'), 'search filters');
});
await session('ConfigPanel/index', async ({ key, wait, text, screen }) => {
  assert.match(text(), /Settings/);
  assert.match(text(), /└.*enter edit/);
  key('\r');
  await wait(() => /enter save/.test(text()), 'editor expands');
  assert.match(text(), /gpt-4.1/);
  assert.match(text(), /└.*esc back/);
  key('!');
  await wait(() => text().includes('!'), 'editor typing');
  key('\r');
  await wait(() => /Model saved/.test(text()), 'save closes editor');
  assert.match(text(), /Settings/);
  assert.match(text(), /└.*enter edit/);
  assert.equal(screen().rows, 9, 'back to actual list height, no grow-only reservation');
});
fs.writeFileSync('/tmp/ink-live-playback-results.json', JSON.stringify(results, null, 2));
console.log('PASS all 5 live interactive demos through localhost WS');
