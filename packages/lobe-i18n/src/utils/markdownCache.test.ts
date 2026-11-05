import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { MarkdownCache, hashContent } from './markdownCache';

describe('MarkdownCache', () => {
  let dir: string;
  let cacheFile: string;
  let source: string;
  let target: string;

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'lobe-i18n-cache-'));
    cacheFile = join(dir, '.i18n-cache.json');
    source = join(dir, 'doc.md');
    target = join(dir, 'doc.en-US.md');
    writeFileSync(source, '# 你好');
  });

  afterEach(() => {
    rmSync(dir, { force: true, recursive: true });
  });

  it('should report missing when target does not exist', () => {
    const cache = new MarkdownCache(cacheFile);
    expect(cache.getStatus(source, target, hashContent('# 你好'))).toBe('missing');
  });

  it('should report untracked when target exists without a cache entry', () => {
    writeFileSync(target, '# Hello');
    const cache = new MarkdownCache(cacheFile);
    expect(cache.getStatus(source, target, hashContent('# 你好'))).toBe('untracked');
  });

  it('should report cached or changed based on the source hash', () => {
    writeFileSync(target, '# Hello');
    const cache = new MarkdownCache(cacheFile);
    cache.set(source, target, hashContent('# 你好'));

    expect(cache.getStatus(source, target, hashContent('# 你好'))).toBe('cached');
    expect(cache.getStatus(source, target, hashContent('# 你好呀'))).toBe('changed');
  });

  it('should treat a pending target as changed', () => {
    writeFileSync(target, '# Hel');
    const cache = new MarkdownCache(cacheFile);
    cache.markPending(source, target);
    expect(cache.getStatus(source, target, hashContent('# 你好'))).toBe('changed');
  });

  it('should persist entries across instances', () => {
    writeFileSync(target, '# Hello');
    new MarkdownCache(cacheFile).set(source, target, hashContent('# 你好'));

    expect(new MarkdownCache(cacheFile).getStatus(source, target, hashContent('# 你好'))).toBe(
      'cached',
    );
    expect(JSON.parse(readFileSync(cacheFile, 'utf8')).version).toBe(1);
  });

  it('should recover from a corrupted cache file', () => {
    writeFileSync(cacheFile, '{ not json');
    writeFileSync(target, '# Hello');
    const cache = new MarkdownCache(cacheFile);
    expect(cache.getStatus(source, target, hashContent('# 你好'))).toBe('untracked');
  });
});
