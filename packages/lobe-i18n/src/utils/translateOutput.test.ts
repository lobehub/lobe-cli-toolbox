import { describe, expect, it } from 'vitest';

import {
  alignToSource,
  cleanMarkdownOutput,
  extractJsonText,
  extractPlaceholders,
  hasSamePlaceholders,
  pickPaths,
} from './translateOutput';

describe('extractJsonText', () => {
  it('unwraps code fences, think blocks and surrounding prose', () => {
    expect(extractJsonText('```json\n{"a":"b"}\n```')).toBe('{"a":"b"}');
    expect(extractJsonText('<think>hmm {x}</think>\n{"a":"b"}')).toBe('{"a":"b"}');
    expect(extractJsonText('Here you go: {"a":"b"} Done.')).toBe('{"a":"b"}');
  });
});

describe('cleanMarkdownOutput', () => {
  it('removes a fence wrapped around the whole document', () => {
    expect(cleanMarkdownOutput('```markdown\n# 标题\n\n正文\n```', '# Title\n\nBody')).toBe(
      '# 标题\n\n正文',
    );
  });

  it('keeps the fence when the source itself is a code block', () => {
    const source = '```js\nconst a = 1;\n```';
    expect(cleanMarkdownOutput(source, source)).toBe(source);
  });

  it('strips a leading think block', () => {
    expect(cleanMarkdownOutput('<think>plan</think>\n# 标题', '# Title')).toBe('# 标题');
  });
});

describe('extractPlaceholders', () => {
  it('collects interpolation, printf, nesting and tags', () => {
    expect(
      extractPlaceholders('Hi {{name}}, {count} items %s $t(common.ok) <b>bold</b> <br/>'),
    ).toEqual(['$t(common.ok)', '%s', '</b>', '<b>', '<br/>', '{count}', '{{name}}'].sort());
  });

  it('only keeps the ICU argument header, branch texts are translated', () => {
    expect(
      hasSamePlaceholders(
        '{count, plural, one {# file} other {# files}}',
        '{count, plural, other {# 个文件}}',
      ),
    ).toBe(true);
  });

  it('ignores whitespace inside placeholders and tag attributes', () => {
    expect(
      hasSamePlaceholders('{{ name }} <a href="/x" title="Open">', '{{name}} <a title="打开">'),
    ).toBe(true);
  });

  it('detects translated or dropped placeholders', () => {
    expect(hasSamePlaceholders('Hello {{name}}', '你好 {{名字}}')).toBe(false);
    expect(hasSamePlaceholders('<0>Click</0> here', '点击这里')).toBe(false);
  });
});

describe('alignToSource', () => {
  it('drops extra keys and reports missing and broken ones', () => {
    const source = { a: 'Hello {{name}}', b: 'World', nested: { c: 'Save', d: 'Cancel' } };
    const output = { a: '你好 {{名字}}', extra: 'x', nested: { c: '保存' } };

    const { invalid, missing, result } = alignToSource(source, output);

    expect(result).toEqual({ nested: { c: '保存' } });
    expect(missing).toEqual([['b'], ['nested', 'd']]);
    expect(invalid).toEqual([['a']]);
  });

  it('treats an empty translation of a non-empty string as missing', () => {
    expect(alignToSource({ a: 'Save' }, { a: ' ' }).missing).toEqual([['a']]);
    expect(alignToSource({ a: '' }, { a: '' }).result).toEqual({ a: '' });
  });

  it('copies non-string values and validates arrays by length', () => {
    const { missing, result } = alignToSource(
      { flag: true, list: ['a', 'b'], n: 1, other: ['x'] },
      { list: ['甲', '乙'], other: [] },
    );
    expect(result).toEqual({ flag: true, list: ['甲', '乙'], n: 1 });
    expect(missing).toEqual([['other']]);
  });

  it('reports everything as missing when the output is not an object', () => {
    expect(alignToSource({ a: 'x', b: { c: 'y' } }, undefined).missing).toEqual([
      ['a'],
      ['b', 'c'],
    ]);
  });

  it('keeps numeric string keys as object keys', () => {
    expect(alignToSource({ 0: 'zero' }, { 0: '零' }).result).toEqual({ 0: '零' });
  });
});

describe('pickPaths', () => {
  it('builds the sub-object for the given paths', () => {
    expect(pickPaths({ a: 'x', b: { c: 'y', d: 'z' } }, [['b', 'd'], ['missing']])).toEqual({
      b: { d: 'z' },
    });
  });
});
