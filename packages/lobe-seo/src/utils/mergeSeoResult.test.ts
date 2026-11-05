import { describe, expect, it } from 'vitest';

import { mergeSeoResult } from './mergeSeoResult';

const seo = { description: 'Generated description', tags: ['ai', 'cli'], title: 'Generated' };

describe('mergeSeoResult', () => {
  it('adds the SEO fields at the top level', () => {
    expect(mergeSeoResult({ date: '2026-01-01' }, seo)).toEqual({ ...seo, date: '2026-01-01' });
  });

  it('keeps fields that already exist in the frontmatter', () => {
    expect(mergeSeoResult({ title: 'Mine' }, seo).title).toBe('Mine');
  });

  it('nests the SEO fields under groupKey', () => {
    expect(
      mergeSeoResult({ date: '2026-01-01', seo: { title: 'Mine' } }, seo, { groupKey: 'seo' }),
    ).toEqual({ date: '2026-01-01', seo: { ...seo, title: 'Mine' } });
  });

  it('stringifies tags when asked', () => {
    expect(mergeSeoResult({}, seo, { tagStringify: true }).tags).toBe('ai, cli');
  });

  it('tolerates a result without tags', () => {
    const { tags: _, ...withoutTags } = seo;
    expect(() =>
      mergeSeoResult({}, withoutTags as typeof seo, { tagStringify: true }),
    ).not.toThrow();
  });

  it('does not mutate its inputs', () => {
    const frontmatter = { seo: { title: 'Mine' } };
    const input = { ...seo, tags: [...seo.tags] };
    mergeSeoResult(frontmatter, input, { groupKey: 'seo', tagStringify: true });

    expect(frontmatter).toEqual({ seo: { title: 'Mine' } });
    expect(input.tags).toEqual(['ai', 'cli']);
  });
});
