import { describe, expect, it } from 'vitest';

import { ChatPromptTemplate, fillTemplate, PromptTemplate } from './promptTemplate';

describe('fillTemplate', () => {
  it('fills every occurrence of a placeholder', () => {
    expect(fillTemplate('{a} and {a}, {b}', { a: '1', b: '2' })).toBe('1 and 1, 2');
  });

  it('keeps unknown and undefined placeholders', () => {
    expect(fillTemplate('{a} {missing}', { a: undefined })).toBe('{a} {missing}');
  });

  it('inserts `$` replacement patterns verbatim', () => {
    const diff = "+echo $$ $& $' $1";
    expect(fillTemplate('diff: {text}', { text: diff })).toBe(`diff: ${diff}`);
  });

  it('does not substitute placeholders found inside inserted values', () => {
    expect(fillTemplate('{a} {b}', { a: '{b}', b: 'x' })).toBe('{b} x');
  });
});

describe('PromptTemplate', () => {
  it('formats a template', () => {
    expect(
      PromptTemplate.fromTemplate<{ name: string }>('hi {name}').format({ name: 'Lobe' }),
    ).toBe('hi Lobe');
  });
});

describe('ChatPromptTemplate', () => {
  it('formats every message and keeps roles', () => {
    const template = ChatPromptTemplate.fromMessages<{ lang: string; text: string }>([
      ['system', 'Translate to {lang}'],
      ['user', '{text}'],
    ]);

    expect(template.formatMessages({ lang: 'en', text: '你好' })).toEqual([
      { content: 'Translate to en', role: 'system' },
      { content: '你好', role: 'user' },
    ]);
  });
});
