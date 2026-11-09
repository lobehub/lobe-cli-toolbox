/**
 * Capture timestamped ANSI frames from a real Ink demo.
 * Each sample is the cumulative stdout stream (Ink cursor moves included) so xterm replay is faithful.
 *
 * Two demo shapes:
 * - React component (default export sync function) → ink.render(createElement(Demo))
 * - Async script (e.g. TaskList/alert) → await Demo(); script owns ink.render via createTaskList
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { createElement } from 'react';

import { createTtyStdin, createTtyStdout, withPatchedStdio } from './ink-tty.mjs';

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

const file = path.resolve(process.argv[2]);
const durationMs = Number(process.argv[3] || 900);
const intervalMs = Number(process.argv[4] || 80);

process.env.FORCE_COLOR = '3';
process.env.COLORTERM = 'truecolor';
process.env.TERM = process.env.TERM || 'xterm-256color';
process.env.CLI_UI_DOCS_CAPTURE = '1';

const { stdout, read } = createTtyStdout(80, 24);
const stdin = createTtyStdin();
const frames = [];
const t0 = Date.now();

const pushSample = () => {
  const ansi = read();
  if (ansi) frames.push({ t: Date.now() - t0, ansi });
};

await withPatchedStdio(stdout, stdin, async () => {
  const mod = await import(`${pathToFileURL(file).href}?frames=${Date.now()}`);
  const Demo = mod.default;
  if (typeof Demo !== 'function')
    throw new Error('demo must default-export a component or async script');

  if (Demo instanceof AsyncFunction) {
    // Script-style: do NOT wrap in an outer Ink tree (createTaskList/alert own the renderer).
    const sampler = setInterval(pushSample, intervalMs);
    try {
      await Demo();
      // Tail samples after script settles (spinners / final Static flush).
      const tailUntil = Date.now() + Math.min(500, Math.max(120, durationMs / 4));
      while (Date.now() < tailUntil) {
        await new Promise((r) => setTimeout(r, intervalMs));
        pushSample();
      }
    } finally {
      clearInterval(sampler);
      pushSample();
    }
    return;
  }

  const { render: inkRender } = await import('ink');
  const instance = inkRender(createElement(Demo), { stdout, stdin, patchConsole: false });
  const deadline = Date.now() + durationMs;
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, intervalMs));
    pushSample();
  }
  instance.unmount();
  await new Promise((r) => setTimeout(r, 40));
  pushSample();
});

const unique = [];
for (const f of frames) {
  if (!unique.length || unique.at(-1).ansi !== f.ansi) unique.push(f);
}
process.stdout.write(JSON.stringify({ file, frames: unique.length ? unique : frames }));
