import fs from 'node:fs';
import { PassThrough } from 'node:stream';

/** Write protocol bytes to the real process stdout FD (bypasses Ink stdout patch). */
export function writeProtocol(line) {
  fs.writeSync(1, typeof line === 'string' ? line : Buffer.from(line));
}

export function createTtyStdout(columns = 80, rows = 24) {
  const stdout = new PassThrough();
  let buf = Buffer.alloc(0);
  const chunks = [];
  stdout.on('data', (chunk) => {
    const b = Buffer.from(chunk);
    buf = Buffer.concat([buf, b]);
    chunks.push({ t: Date.now(), data: b });
  });
  Object.defineProperty(stdout, 'isTTY', { value: true });
  Object.defineProperty(stdout, 'columns', { value: columns });
  Object.defineProperty(stdout, 'rows', { value: rows });
  stdout.getColorDepth = () => 24;
  stdout.hasColors = () => true;
  return {
    stdout,
    read: () => buf.toString('utf8'),
    drainChunks: () => {
      const out = chunks.splice(0, chunks.length);
      return out;
    },
    resetBuffer: () => {
      buf = Buffer.alloc(0);
    },
  };
}

export function createTtyStdin() {
  const stdin = new PassThrough();
  Object.defineProperty(stdin, 'isTTY', { value: true });
  stdin.setRawMode = () => stdin;
  stdin.ref = () => {};
  stdin.unref = () => {};
  return stdin;
}

export async function withPatchedStdio(stdout, stdin, fn) {
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
