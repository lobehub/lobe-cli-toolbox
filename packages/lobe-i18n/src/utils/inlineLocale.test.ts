import { describe, expect, it } from 'vitest';

import { diff } from './diffJson';
import { createInlineDocument, findLocaleNodes } from './inlineLocale';

const options = { entryLocale: 'zh', locales: ['en'] };

describe('findLocaleNodes', () => {
  it('finds a root locale node', () => {
    expect(findLocaleNodes({ en: { a: 'A' }, zh: { a: '甲' } }, options)).toEqual([[]]);
  });

  it('finds locale nodes nested in objects and arrays', () => {
    const data = {
      layers: [
        { code: 'L1', dirs: ['fundamentals'], name: { en: 'Basics', zh: '基础' } },
        { code: 'L2', desc: { zh: '能源' }, name: { en: 'Energy', zh: '能源' } },
      ],
      version: 1,
    };
    expect(findLocaleNodes(data, options)).toEqual([
      ['layers', '0', 'name'],
      ['layers', '1', 'desc'],
      ['layers', '1', 'name'],
    ]);
  });

  it('ignores objects with keys that are not locales or without the entry locale', () => {
    expect(findLocaleNodes({ a: { en: 'A', id: 'x', zh: '甲' }, b: { en: 'B' } }, options)).toEqual(
      [],
    );
  });

  it('ignores a root node holding a plain string', () => {
    expect(findLocaleNodes({ en: 'A', zh: '甲' }, options)).toEqual([]);
  });
});

describe('createInlineDocument', () => {
  it('encodes arrays as index keys and skips non-string values', () => {
    const data = {
      zh: [{ ok: 0, opts: ['甲', '乙'], q: '问题' }],
    };
    const document = createInlineDocument(data, options);
    expect(document.entry).toEqual({ '0': { opts: { '0': '甲', '1': '乙' }, q: '问题' } });
    expect(document.target('en')).toEqual({});
  });

  it('writes a missing locale with the shape and order of the source', () => {
    const data: any = { zh: [{ ok: 1, opts: ['甲', '乙'], q: '问题' }] };
    const document = createInlineDocument(data, options);

    const changed = document.apply('en', { '0': { opts: { '0': 'A', '1': 'B' }, q: 'Question' } });
    expect(changed).toBe(true);
    expect(data.en).toEqual([{ ok: 1, opts: ['A', 'B'], q: 'Question' }]);
    expect(Object.keys(data.en[0])).toEqual(['ok', 'opts', 'q']);
  });

  it('copies copyKeys from the source instead of translating them', () => {
    const data: any = {
      en: { cards: [{ best: 'lead', id: 'a1', text: 'Old' }], kind: 'sort' },
      zh: { cards: [{ best: 'aid', id: 'a1', text: '卡片' }], kind: 'sort' },
    };
    const document = createInlineDocument(data, { ...options, copyKeys: ['best', 'id', 'kind'] });

    expect(document.entry).toEqual({ cards: { '0': { text: '卡片' } } });
    expect(document.target('en')).toEqual({ cards: { '0': { text: 'Old' } } });

    // Nothing to translate, but the copied `best` follows the source.
    expect(diff(document.entry, document.target('en')).add).toEqual([]);
    expect(document.apply('en', document.target('en'))).toBe(true);
    expect(data.en).toEqual({ cards: [{ best: 'aid', id: 'a1', text: 'Old' }], kind: 'sort' });
  });

  it('only translates keys that are new in the source', () => {
    const data: any = {
      en: { msgs: { one: 'One' }, title: 'Title' },
      zh: { msgs: { few: '{n} 条', one: '一条' }, title: '标题' },
    };
    const document = createInlineDocument(data, options);
    const target = document.target('en');

    expect(diff(document.entry, target).entry).toEqual({ msgs: { few: '{n} 条' } });

    document.apply('en', { ...target, msgs: { few: '{n} requests', one: 'One' } });
    expect(data.en).toEqual({ msgs: { few: '{n} requests', one: 'One' }, title: 'Title' });
  });

  it('retranslates an array whose length changed', () => {
    const data: any = { en: { opts: ['A', 'B'] }, zh: { opts: ['甲', '乙', '丙'] } };
    const document = createInlineDocument(data, options);
    expect(document.target('en')).toEqual({});
  });

  it('leaves an array out until every item is translated', () => {
    const data: any = { zh: { opts: ['甲', '乙'], title: '标题' } };
    const document = createInlineDocument(data, options);
    document.apply('en', { opts: { '0': 'A' }, title: 'Title' });
    expect(data.en).toEqual({ title: 'Title' });
  });

  it('drops keys that were removed from the source', () => {
    const data: any = { en: { a: 'A', gone: 'Gone' }, zh: { a: '甲' } };
    const document = createInlineDocument(data, options);
    expect(document.apply('en', document.target('en'))).toBe(true);
    expect(data.en).toEqual({ a: 'A' });
  });

  it('translates nested leaf nodes in place and keeps other fields', () => {
    const data: any = {
      layers: [{ code: 'L1', desc: { zh: '描述' }, name: { en: 'Basics', zh: '基础' } }],
    };
    const document = createInlineDocument(data, options);

    expect(document.entry).toEqual({ layers: { '0': { desc: '描述', name: '基础' } } });
    expect(document.target('en')).toEqual({ layers: { '0': { name: 'Basics' } } });

    document.apply('en', { layers: { '0': { desc: 'Description', name: 'Basics' } } });
    expect(data.layers[0]).toEqual({
      code: 'L1',
      desc: { en: 'Description', zh: '描述' },
      name: { en: 'Basics', zh: '基础' },
    });
  });

  it('reports no change when the translation is already there', () => {
    const data = { en: { a: 'A' }, zh: { a: '甲' } };
    const document = createInlineDocument(data, options);
    expect(document.apply('en', document.target('en'))).toBe(false);
  });
});
