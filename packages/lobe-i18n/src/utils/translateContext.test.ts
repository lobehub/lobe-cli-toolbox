import { describe, expect, it } from 'vitest';

import { getLocaleName } from './localeName';
import { createExamplePicker, pickGlossary } from './translateContext';

describe('pickGlossary', () => {
  const glossary = {
    LobeHub: 'LobeHub',
    agent: { 'ja-JP': 'エージェント', 'zh-CN': '助手' },
  };

  it('only returns terms present in the text, resolved per locale', () => {
    expect(pickGlossary(glossary, 'Create an Agent', 'zh-CN')).toEqual([
      { source: 'agent', target: '助手' },
    ]);
    expect(pickGlossary(glossary, 'Welcome to LobeHub', 'de-DE')).toEqual([
      { source: 'LobeHub', target: 'LobeHub' },
    ]);
  });

  it('skips terms without a translation for the locale', () => {
    expect(pickGlossary(glossary, 'agent', 'de-DE')).toEqual([]);
    expect(pickGlossary(undefined, 'agent', 'zh-CN')).toEqual([]);
  });
});

describe('createExamplePicker', () => {
  const entry = {
    chat: { send: 'Send message', stop: 'Stop generating' },
    settings: { save: 'Save settings', title: 'Settings' },
    unchanged: 'OK',
  };
  const target = {
    chat: { send: '发送消息', stop: '停止生成' },
    settings: { save: '保存设置', title: '设置' },
    unchanged: 'OK',
  };

  it('prefers pairs that share words with the chunk, then the namespace', () => {
    const pick = createExamplePicker(entry, target);
    const examples = pick({ chat: { retry: 'Retry message' } }, 2);
    expect(examples).toEqual([
      { source: 'Send message', target: '发送消息' },
      { source: 'Stop generating', target: '停止生成' },
    ]);
  });

  it('skips untranslated values and respects the limit', () => {
    const pick = createExamplePicker(entry, target);
    const examples = pick({ other: 'Something' }, 20);
    expect(examples.map((item) => item.source)).not.toContain('OK');
    expect(pick({ other: 'x' }, 0)).toEqual([]);
  });

  it('matches namespaces of flat dotted keys', () => {
    const pick = createExamplePicker(
      { 'chat.send': 'Send', 'settings.title': 'Settings' },
      { 'chat.send': '发送', 'settings.title': '设置' },
    );
    expect(pick({ 'settings.save': 'Save' }, 1)).toEqual([{ source: 'Settings', target: '设置' }]);
  });
});

describe('getLocaleName', () => {
  it('adds the English language name and keeps the code', () => {
    expect(getLocaleName('ja-JP')).toBe('Japanese (Japan) (ja-JP)');
    expect(getLocaleName('zh_CN')).toBe('Chinese (China) (zh_CN)');
  });

  it('falls back to the code for unknown locales', () => {
    expect(getLocaleName('not a locale')).toBe('not a locale');
  });
});
