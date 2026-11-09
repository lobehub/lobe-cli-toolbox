/**
 * Render a docs demo module under Ink and return raw ANSI (with color).
 */
import { PassThrough } from 'node:stream';
import { pathToFileURL } from 'node:url';

import { createElement, isValidElement } from 'react';

function createTtyStdout(columns = 80, rows = 24) {
  const stdout = new PassThrough();
  let buf = Buffer.alloc(0);
  stdout.on('data', (chunk) => {
    buf = Buffer.concat([buf, Buffer.from(chunk)]);
  });
  Object.defineProperty(stdout, 'isTTY', { value: true });
  Object.defineProperty(stdout, 'columns', { value: columns });
  Object.defineProperty(stdout, 'rows', { value: rows });
  stdout.getColorDepth = () => 24;
  stdout.hasColors = () => true;
  return {
    stdout,
    read: () => buf.toString('utf8'),
  };
}

function createTtyStdin() {
  // Minimal TTY stdin so Ink useInput/raw-mode demos do not throw into the frame.
  const stdin = new PassThrough();
  Object.defineProperty(stdin, 'isTTY', { value: true });
  stdin.setRawMode = () => stdin;
  stdin.ref = () => {};
  stdin.unref = () => {};
  return stdin;
}

async function withPatchedStdio(stdout, stdin, fn) {
  const originalOut = process.stdout;
  const originalIn = process.stdin;
  const outDesc = Object.getOwnPropertyDescriptor(process, 'stdout');
  const inDesc = Object.getOwnPropertyDescriptor(process, 'stdin');

  const patchedOut = new Proxy(originalOut, {
    get(target, prop, receiver) {
      if (prop === 'write') {
        return (chunk, encoding, cb) => {
          stdout.write(typeof chunk === 'string' ? chunk : Buffer.from(chunk));
          if (typeof encoding === 'function') encoding();
          else if (typeof cb === 'function') cb();
          return true;
        };
      }
      if (prop === 'isTTY') return true;
      if (prop === 'columns') return stdout.columns;
      if (prop === 'rows') return stdout.rows;
      if (prop === 'getColorDepth') return () => 24;
      if (prop === 'hasColors') return () => true;
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  Object.defineProperty(process, 'stdout', { configurable: true, value: patchedOut });
  Object.defineProperty(process, 'stdin', { configurable: true, value: stdin });
  try {
    return await fn();
  } finally {
    if (outDesc) Object.defineProperty(process, 'stdout', outDesc);
    else Object.defineProperty(process, 'stdout', { configurable: true, value: originalOut });
    if (inDesc) Object.defineProperty(process, 'stdin', inDesc);
    else Object.defineProperty(process, 'stdin', { configurable: true, value: originalIn });
  }
}

function stripCaptureNoise(ansi) {
  // Drop React/Ink reconciler overlays; keep consola alert.error lines.
  const lines = ansi.split(/\r?\n/);
  const cleaned = [];
  let skipping = false;
  for (const line of lines) {
    // eslint-disable-next-line no-control-regex -- Match ANSI CSI/OSC protocol byte ranges, not human text.
    const plain = line.replaceAll(/\x1B\[[0-9;]*m/g, '');
    if (
      /react-reconciler|Raw mode is not supported|Invariant Violation|was not wrapped in act/.test(
        plain,
      )
    ) {
      skipping = true;
      continue;
    }
    if (skipping) {
      if (
        !plain.trim() ||
        /^\s/.test(plain) ||
        /node_modules|\(\//.test(plain) ||
        plain.startsWith('-')
      ) {
        continue;
      }
      skipping = false;
    }
    cleaned.push(line);
  }
  return cleaned.join('\n');
}

export async function captureInkDemoFile(
  absPath,
  { columns = 80, rows = 24, settleMs = 160 } = {},
) {
  process.env.FORCE_COLOR = '3';
  process.env.COLORTERM = 'truecolor';
  process.env.TERM = process.env.TERM || 'xterm-256color';
  process.env.CLI_UI_DOCS_CAPTURE = '1';

  const { stdout, read } = createTtyStdout(columns, rows);
  const stdin = createTtyStdin();
  const mod = await import(`${pathToFileURL(absPath).href}?capture=${Date.now()}`);
  const Demo = mod.default;
  if (typeof Demo !== 'function') {
    throw new Error(`Demo ${absPath} must default-export a function/component`);
  }

  await withPatchedStdio(stdout, stdin, async () => {
    const originalErrWrite = process.stderr.write.bind(process.stderr);
    // Consola/alert demos write to stderr — fold into the capture buffer, then strip React noise.
    process.stderr.write = (chunk, encoding, cb) => {
      stdout.write(typeof chunk === 'string' ? chunk : Buffer.from(chunk));
      if (typeof encoding === 'function') encoding();
      else if (typeof cb === 'function') cb();
      return true;
    };

    try {
      const result = Demo();
      if (result && typeof result.then === 'function') {
        await result;
        await new Promise((r) => setTimeout(r, settleMs));
        return;
      }

      const { render: inkRender } = await import('ink');
      const element = isValidElement(result) ? result : createElement(Demo);
      const instance = inkRender(element, {
        stdout,
        stdin,
        patchConsole: false,
      });
      await new Promise((r) => setTimeout(r, settleMs));
      instance.unmount();
      await new Promise((r) => setTimeout(r, 40));
      try {
        await instance.waitUntilExit();
      } catch {
        // ignore
      }
    } finally {
      process.stderr.write = originalErrWrite;
    }
  });

  let ansi = stripCaptureNoise(read());
  if (!ansi.trim()) throw new Error(`Empty ANSI capture for ${absPath}`);
  return ansi;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const file = process.argv[2];
  const ansi = await captureInkDemoFile(file);
  process.stdout.write(ansi);
}
