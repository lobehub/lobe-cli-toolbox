import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { I18nConfig } from '../types/config';
import { createInlineDocument } from '../utils/inlineLocale';
import { I18n } from './I18n';
import { TranslateLocale } from './TranslateLocale';

const generate = vi.fn();

vi.mock('@lobehub/cli-common/llm', () => ({
  LLMClient: class {
    generate = generate;
  },
}));

const provider = {
  apiKey: 'sk-test',
  apiType: 'chat-completions',
  baseURL: 'https://example.com/v1',
  model: 'test-model',
} as any;

const config = (overrides: Partial<I18nConfig> = {}): I18nConfig => ({
  concurrency: 2,
  entry: 'locales/en.json',
  entryLocale: 'en-US',
  output: 'locales',
  outputLocales: ['zh-CN'],
  saveImmediately: false,
  ...overrides,
});

const reply = (json: unknown, totalTokens = 10) => ({ text: JSON.stringify(json), totalTokens });

/** Fake model: uppercases every string value of the JSON it receives. */
const echoUppercase = async ({ messages }: any) => {
  const input = JSON.parse(messages.at(-1).content);
  const upper = (obj: any): any =>
    Object.fromEntries(
      Object.entries(obj).map(([k, v]) => [k, typeof v === 'string' ? v.toUpperCase() : upper(v)]),
    );
  return reply(upper(input));
};

beforeEach(() => {
  generate.mockReset();
});

describe('TranslateLocale.runByJson', () => {
  it('retries only the missing and broken keys with feedback', async () => {
    generate
      .mockResolvedValueOnce(reply({ a: '你好 {{名字}}', b: '世界' }))
      .mockResolvedValueOnce(reply({ a: '你好 {{name}}', c: '保存' }));

    const service = new TranslateLocale(config(), provider);
    const { failed, result, tokenUsage } = await service.runByJson({
      json: { a: 'Hello {{name}}', b: 'World', c: 'Save' },
      to: 'zh-CN',
    });

    expect(result).toEqual({ a: '你好 {{name}}', b: '世界', c: '保存' });
    expect(failed).toEqual([]);
    expect(tokenUsage).toBe(20);

    const retry = generate.mock.calls[1]![0];
    expect(JSON.parse(retry.messages.at(-1).content)).toEqual({ a: 'Hello {{name}}', c: 'Save' });
    expect(retry.messages[0].content).toContain('`c`');
    expect(retry.messages[0].content).toContain('`a`');
  });

  it('leaves keys untranslated after the last attempt instead of exiting', async () => {
    generate.mockResolvedValue({ text: 'not json at all', totalTokens: 5 });

    const service = new TranslateLocale(config(), provider);
    const { failed, result } = await service.runByJson({ json: { a: 'Hello' }, to: 'zh-CN' });

    expect(result).toEqual({});
    expect(failed).toEqual([['a']]);
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it('parses fenced output and sends glossary terms and language names', async () => {
    generate.mockResolvedValueOnce({ text: '```json\n{"a":"LobeHub 助手"}\n```' });

    const service = new TranslateLocale(
      config({ glossary: { LobeHub: 'LobeHub', agent: { 'zh-CN': '助手' } } }),
      provider,
    );
    const { result } = await service.runByJson({ json: { a: 'LobeHub agent' }, to: 'zh-CN' });

    expect(result).toEqual({ a: 'LobeHub 助手' });
    const system = generate.mock.calls[0]![0].messages[0].content;
    expect(system).toContain('Chinese (China) (zh-CN)');
    expect(system).toContain('"agent" → "助手"');
  });
});

describe('I18n.translate', () => {
  it('runs chunks of different files in parallel within the shared limit', async () => {
    let active = 0;
    let peak = 0;
    generate.mockImplementation(async (request: any) => {
      active++;
      peak = Math.max(peak, active);
      await new Promise((resolve) => setTimeout(resolve, 5));
      active--;
      return echoUppercase(request);
    });

    const i18n = new I18n({ config: config({ concurrency: 3, splitToken: 20 }), provider });
    const entry = Object.fromEntries(
      Array.from({ length: 6 }, (_, i) => [`k${i}`, `value number ${i}`]),
    );

    const results = await Promise.all(
      ['zh-CN', 'ja-JP'].map((to) => i18n.translate({ entry, target: {}, to })),
    );

    expect(peak).toBe(3);
    for (const outcome of results) {
      expect(outcome?.errors).toEqual([]);
      expect(outcome?.result?.['k5']).toBe('VALUE NUMBER 5');
    }
  });

  it('keeps successful chunks when another chunk fails', async () => {
    generate.mockImplementation(async (request: any) => {
      if (request.messages.at(-1).content.includes('k0')) throw new Error('rate limited');
      return echoUppercase(request);
    });

    const i18n = new I18n({ config: config({ splitToken: 12 }), provider });
    const outcome = await i18n.translate({
      entry: { k0: 'first value', k1: 'second value' },
      target: { old: '旧' },
      to: 'zh-CN',
    });

    expect(outcome?.errors).toHaveLength(1);
    expect(outcome?.result).toEqual({ k1: 'SECOND VALUE', old: '旧' });
  });

  it('stops every pending request after an authentication error', async () => {
    generate.mockRejectedValue(Object.assign(new Error('Unauthorized'), { statusCode: 401 }));

    const i18n = new I18n({ config: config({ concurrency: 1, splitToken: 12 }), provider });
    await expect(
      i18n.translate({ entry: { a: 'first value', b: 'second value' }, target: {}, to: 'zh-CN' }),
    ).rejects.toThrow('Unauthorized');
    expect(generate).toHaveBeenCalledTimes(1);
  });

  it('translates an inline document and saves it through `save` after each chunk', async () => {
    generate.mockImplementation(echoUppercase);

    const data: any = {
      en: [{ ok: 0, opts: ['old a', 'old b'], q: 'Old question' }],
      zh: [
        { ok: 0, opts: ['old a', 'old b'], q: 'old question' },
        { ok: 1, opts: ['new a', 'new b'], q: 'new question' },
      ],
    };
    const document = createInlineDocument(data, { entryLocale: 'zh', locales: ['en'] });
    const save = vi.fn((result) => document.apply('en', result));

    const i18n = new I18n({
      config: config({ keyStyle: 'flat', saveImmediately: true }),
      provider,
    });
    const outcome = await i18n.translate({
      entry: document.entry,
      filename: 'should-not-be-written.json',
      keyStyle: 'nested',
      save,
      target: document.target('en'),
      to: 'en',
    });

    expect(outcome?.errors).toEqual([]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(data.en).toEqual([
      { ok: 0, opts: ['OLD A', 'OLD B'], q: 'OLD QUESTION' },
      { ok: 1, opts: ['NEW A', 'NEW B'], q: 'NEW QUESTION' },
    ]);
  });

  it('appends new array items to an array leaf with flat keys', async () => {
    generate.mockImplementation(echoUppercase);

    const i18n = new I18n({ config: config({ keyStyle: 'flat' }), provider });
    const outcome = await i18n.translate({
      entry: { 'faq.list': [{ q: 'First' }, { q: 'Second' }, { q: 'Third' }] },
      target: { 'faq.list': [{ q: '第一' }] },
      to: 'zh-CN',
    });

    expect(outcome?.result).toEqual({
      'faq.list': [{ q: '第一' }, { q: 'SECOND' }, { q: 'THIRD' }],
    });
  });

  it('sends existing translations of the target as examples', async () => {
    generate.mockImplementation(echoUppercase);

    const i18n = new I18n({ config: config(), provider });
    await i18n.translate({
      entry: { chat: { retry: 'Retry message', send: 'Send message' } },
      target: { chat: { send: '发送消息' } },
      to: 'zh-CN',
    });

    const system = generate.mock.calls[0]![0].messages[0].content;
    expect(system).toContain('"Send message" → "发送消息"');
  });
});
