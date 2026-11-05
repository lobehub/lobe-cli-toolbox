import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Shebang, { addShebang, DEFAULT_SHEBANG } from './Shebang';

vi.mock('consola', () => ({
  consola: { error: vi.fn(), info: vi.fn(), success: vi.fn(), warn: vi.fn() },
}));

describe('addShebang', () => {
  it('prepends the default shebang', () => {
    expect(addShebang('console.log(1);\n')).toBe(`${DEFAULT_SHEBANG}\nconsole.log(1);\n`);
  });

  it('accepts a custom shebang', () => {
    expect(addShebang('print(1)', '#!/usr/bin/env python3')).toBe(
      '#!/usr/bin/env python3\nprint(1)',
    );
  });

  it('leaves files that already start with any shebang', () => {
    expect(addShebang('#!/bin/sh\necho 1')).toBeUndefined();
  });

  it('only treats the first line as a shebang', () => {
    const content = "const s = '#!/usr/bin/env node';\n";
    expect(addShebang(content)).toBe(`${DEFAULT_SHEBANG}\n${content}`);
  });
});

describe('Shebang', () => {
  let dir: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lobe-shebang-'));
  });

  afterEach(() => {
    rmSync(dir, { force: true, recursive: true });
  });

  it('writes the shebang once', () => {
    const file = join(dir, 'cli.js');
    writeFileSync(file, 'run();\n');

    expect(Shebang(file)).toBe(true);
    expect(Shebang(file)).toBe(true);
    expect(readFileSync(file, 'utf8')).toBe(`${DEFAULT_SHEBANG}\nrun();\n`);
  });

  it('fails for missing and empty files', () => {
    const empty = join(dir, 'empty.js');
    writeFileSync(empty, '');

    expect(Shebang(join(dir, 'missing.js'))).toBe(false);
    expect(Shebang(empty)).toBe(false);
    expect(readFileSync(empty, 'utf8')).toBe('');
  });
});
