import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

export const DEFAULT_MARKDOWN_CACHE_FILE = '.i18n-cache.json';

const CACHE_VERSION = 1;

interface MarkdownCacheEntry {
  hash: string;
  source: string;
}

interface MarkdownCacheData {
  markdown: Record<string, MarkdownCacheEntry>;
  version: number;
}

export type MarkdownCacheStatus = 'missing' | 'changed' | 'cached' | 'untracked';

const toKey = (filePath: string) => relative('.', resolve(filePath)).split(sep).join('/');

export const hashContent = (content: string) => createHash('sha256').update(content).digest('hex');

export class MarkdownCache {
  private data: MarkdownCacheData;
  private readonly file: string;

  constructor(file: string = DEFAULT_MARKDOWN_CACHE_FILE) {
    this.file = resolve(file);
    this.data = this.load();
  }

  /**
   * - missing: target file does not exist
   * - changed: source content changed since the target was translated
   * - cached: target is up to date with the source
   * - untracked: target exists but was never recorded (e.g. translated before cache existed)
   */
  getStatus(sourceFile: string, targetFile: string, hash: string): MarkdownCacheStatus {
    if (!existsSync(targetFile)) return 'missing';
    const entry = this.data.markdown[toKey(targetFile)];
    if (!entry) return 'untracked';
    return entry.hash === hash && entry.source === toKey(sourceFile) ? 'cached' : 'changed';
  }

  /**
   * Mark a target as in progress, so a partially written file (e.g. via `saveImmediately`)
   * is retranslated instead of being trusted as `untracked` if the run is interrupted.
   */
  markPending(sourceFile: string, targetFile: string) {
    this.set(sourceFile, targetFile, '');
  }

  set(sourceFile: string, targetFile: string, hash: string) {
    this.data.markdown[toKey(targetFile)] = { hash, source: toKey(sourceFile) };
    this.save();
  }

  private load(): MarkdownCacheData {
    if (existsSync(this.file)) {
      try {
        const data = JSON.parse(readFileSync(this.file, 'utf8'));
        if (data?.version === CACHE_VERSION && data.markdown) return data;
      } catch {
        // fall through and rebuild a corrupted cache
      }
    }
    return { markdown: {}, version: CACHE_VERSION };
  }

  private save() {
    const markdown = Object.fromEntries(
      Object.entries(this.data.markdown).sort(([a], [b]) => a.localeCompare(b)),
    );
    writeFileSync(this.file, JSON.stringify({ ...this.data, markdown }, null, 2) + '\n', 'utf8');
  }
}
