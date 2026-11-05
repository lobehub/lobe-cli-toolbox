import { describe, expect, it } from 'vitest';

import { compressDiff, DEFAULT_IGNORES, filterDiff, splitDiffByFile } from './diff';

const fileDiff = (path: string, body: string[]) =>
  [
    `diff --git a/${path} b/${path}`,
    'index 1111111..2222222 100644',
    `--- a/${path}`,
    `+++ b/${path}`,
    '@@ -1,3 +1,3 @@',
    ...body,
  ].join('\n');

describe('splitDiffByFile', () => {
  it('splits on file headers', () => {
    const diff = [fileDiff('a.ts', ['+a']), fileDiff('b.ts', ['-b'])].join('\n');
    expect(splitDiffByFile(diff).map((lines) => lines[0])).toEqual([
      'diff --git a/a.ts b/a.ts',
      'diff --git a/b.ts b/b.ts',
    ]);
  });
});

describe('filterDiff', () => {
  it('removes the whole diff of ignored files', () => {
    const diff = [
      fileDiff('src/index.ts', ['+keep']),
      fileDiff('pnpm-lock.yaml', ['+lockfile change', '-old']),
      fileDiff('packages/app/yarn.lock', ['+nested lockfile']),
      fileDiff('assets/logo.png', ['Binary files differ']),
      fileDiff('src/util.ts', ['+also keep']),
    ].join('\n');

    const result = filterDiff(diff, DEFAULT_IGNORES);

    expect(result).toBe(
      [fileDiff('src/index.ts', ['+keep']), fileDiff('src/util.ts', ['+also keep'])].join('\n'),
    );
  });

  it('honours custom patterns', () => {
    const diff = [fileDiff('docs/a.md', ['+doc']), fileDiff('src/a.ts', ['+code'])].join('\n');
    expect(filterDiff(diff, ['docs/**'])).toBe(fileDiff('src/a.ts', ['+code']));
  });

  it('keeps an empty diff empty', () => {
    expect(filterDiff('', DEFAULT_IGNORES)).toBe('');
  });
});

describe('compressDiff', () => {
  it('returns small diffs unchanged', () => {
    const diff = fileDiff('a.ts', ['+a', ' context']);
    expect(compressDiff(diff)).toBe(diff);
  });

  it('drops unchanged context first and keeps changes under their file header', () => {
    const context = Array.from({ length: 30 }, (_, i) => ` line ${i}`);
    const diff = [
      fileDiff('a.ts', [...context, '+added in a']),
      fileDiff('b.ts', [...context, '-removed in b']),
    ].join('\n');

    const lines = compressDiff(diff, 40).split('\n');

    expect(lines).not.toContain(' line 0');
    expect(lines.indexOf('+added in a')).toBeGreaterThan(lines.indexOf('+++ b/a.ts'));
    expect(lines.indexOf('-removed in b')).toBeGreaterThan(lines.indexOf('+++ b/b.ts'));
    expect(lines.indexOf('+added in a')).toBeLessThan(lines.indexOf('diff --git a/b.ts b/b.ts'));
  });

  it('gives every file a share of the budget when changes alone are too long', () => {
    const changes = Array.from({ length: 100 }, (_, i) => `+change ${i}`);
    const diff = [fileDiff('a.ts', changes), fileDiff('b.ts', changes)].join('\n');

    const result = compressDiff(diff, 40);

    expect(result).toContain('diff --git a/a.ts b/a.ts');
    expect(result).toContain('diff --git a/b.ts b/b.ts');
    expect(result).toMatch(/lines truncated\)/);
    expect(result.split('\n').length).toBeLessThan(50);
  });
});
