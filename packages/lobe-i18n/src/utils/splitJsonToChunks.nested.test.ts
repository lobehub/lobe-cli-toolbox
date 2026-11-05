import { merge } from 'lodash-es';
import { describe, expect, it } from 'vitest';

import type { I18nConfig } from '../types/config';
import { calcJsonToken } from './calcToken';
import { splitJsonToChunks } from './splitJsonToChunks';

const config = {
  entry: 'locales/en.json',
  entryLocale: 'en',
  output: 'locales',
  outputLocales: ['zh-CN'],
} as I18nConfig;

const sentence = (n: number) => `This is sentence number ${n} of a fairly long locale value.`;

describe('splitJsonToChunks (real token counts)', () => {
  it('splits an oversized namespace and the chunks merge back to the entry', () => {
    const entry = {
      big: Object.fromEntries(Array.from({ length: 60 }, (_, i) => [`key${i}`, sentence(i)])),
      small: 'Hello',
    };

    const splitToken = 300;
    const chunks = splitJsonToChunks({ ...config, splitToken }, entry, {});

    expect(chunks.length).toBeGreaterThan(3);
    for (const chunk of chunks) {
      expect(Object.keys(chunk).length).toBeGreaterThan(0);
      expect(calcJsonToken(chunk)).toBeLessThanOrEqual(splitToken + 10);
    }
    expect(merge({}, ...chunks)).toEqual(entry);
  });

  it('does not emit an empty chunk when the first value is larger than the limit', () => {
    const entry = { huge: 'word '.repeat(200), next: 'Hi' };
    const chunks = splitJsonToChunks({ ...config, splitToken: 50 }, entry, {});
    expect(chunks).toEqual([{ huge: entry.huge }, { next: 'Hi' }]);
  });

  it('only includes keys missing from the target', () => {
    const chunks = splitJsonToChunks(
      config,
      { a: 'A', b: { c: 'C', d: 'D' } },
      { a: '甲', b: { c: '丙' } },
    );
    expect(chunks).toEqual([{ b: { d: 'D' } }]);
  });
});
