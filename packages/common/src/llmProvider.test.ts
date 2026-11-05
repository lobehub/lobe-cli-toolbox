import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { listModels, LLMClient } from './llm';
import { resolveProviderConfig } from './providers';

const { generateText, streamText } = vi.hoisted(() => ({
  generateText: vi.fn(),
  streamText: vi.fn(),
}));

vi.mock('ai', async (importOriginal) => ({
  ...(await importOriginal<typeof import('ai')>()),
  generateText,
  streamText,
}));

const ENV_KEYS = [
  'LOBE_PROVIDER',
  'LOBE_API_TYPE',
  'LOBE_BASE_URL',
  'LOBE_API_KEY',
  'OPENAI_API_KEY',
  'OPENAI_PROXY_URL',
  'DEEPSEEK_API_KEY',
];

beforeEach(() => {
  for (const key of ENV_KEYS) vi.stubEnv(key, '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const mockFetch = (body: any) => {
  const fetch = vi.fn().mockResolvedValue({ json: async () => body, ok: true });
  vi.stubGlobal('fetch', fetch);
  return fetch;
};

const createClient = (apiType: 'chat-completions' | 'anthropic' = 'chat-completions') =>
  new LLMClient(resolveProviderConfig({ apiKey: 'k', apiType, model: 'm', provider: 'custom' }));

describe('resolveProviderConfig', () => {
  it('keeps legacy configs on OpenAI Chat Completions with env taking precedence', () => {
    vi.stubEnv('OPENAI_API_KEY', 'sk-env');
    vi.stubEnv('OPENAI_PROXY_URL', 'https://relay.example.com/v1/');

    expect(resolveProviderConfig({ apiKey: 'sk-stored', baseURL: 'https://stored/v1' })).toEqual({
      apiKey: 'sk-env',
      apiType: 'chat-completions',
      baseURL: 'https://relay.example.com/v1',
      model: 'gpt-5-mini',
      noApiKey: false,
      provider: 'openai',
      providerName: 'OpenAI',
    });
  });

  it('uses preset defaults, falling back to the provider env key', () => {
    vi.stubEnv('DEEPSEEK_API_KEY', 'sk-deepseek');

    expect(resolveProviderConfig({ provider: 'deepseek' })).toMatchObject({
      apiKey: 'sk-deepseek',
      apiType: 'chat-completions',
      baseURL: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat',
    });
    expect(resolveProviderConfig({ apiKey: 'sk-stored', provider: 'deepseek' }).apiKey).toBe(
      'sk-stored',
    );
  });

  it('picks the preset endpoint of the chosen protocol', () => {
    expect(resolveProviderConfig({ apiType: 'anthropic', provider: 'deepseek' }).baseURL).toBe(
      'https://api.deepseek.com/anthropic',
    );
    expect(resolveProviderConfig({ provider: 'openai' }).apiType).toBe('responses');
  });

  it('supports custom endpoints', () => {
    expect(
      resolveProviderConfig({
        apiKey: 'k',
        apiType: 'anthropic',
        baseURL: 'https://gateway.example.com/',
        model: 'my-model',
        provider: 'custom',
      }),
    ).toMatchObject({
      apiType: 'anthropic',
      baseURL: 'https://gateway.example.com',
      model: 'my-model',
      providerName: 'Custom',
    });
  });

  it('lets LOBE_* env override the stored config', () => {
    vi.stubEnv('LOBE_PROVIDER', 'custom');
    vi.stubEnv('LOBE_API_TYPE', 'responses');
    vi.stubEnv('LOBE_BASE_URL', 'https://ci.example.com/v1');
    vi.stubEnv('LOBE_API_KEY', 'sk-ci');

    expect(
      resolveProviderConfig({ apiKey: 'stored', model: 'm', provider: 'deepseek' }),
    ).toMatchObject({
      apiKey: 'sk-ci',
      apiType: 'responses',
      baseURL: 'https://ci.example.com/v1',
      provider: 'custom',
    });
  });

  it('marks local runtimes as not needing a key', () => {
    expect(resolveProviderConfig({ model: 'qwen3', provider: 'ollama' })).toMatchObject({
      baseURL: 'http://127.0.0.1:11434/v1',
      noApiKey: true,
    });
  });
});

describe('listModels', () => {
  it('lists OpenAI compatible models', async () => {
    const fetch = mockFetch({ data: [{ id: 'b' }, { id: 'a' }, { id: 'a' }] });
    const models = await listModels({
      apiKey: 'k',
      apiType: 'chat-completions',
      baseURL: 'https://x/v1',
    });

    expect(models).toEqual(['a', 'b']);
    expect(fetch.mock.calls[0]![0]).toBe('https://x/v1/models');
    expect(fetch.mock.calls[0]![1].headers).toEqual({ Authorization: 'Bearer k' });
  });

  it('lists Anthropic compatible models', async () => {
    const fetch = mockFetch({ data: [{ id: 'claude-x' }] });
    await listModels({ apiKey: 'k', apiType: 'anthropic', baseURL: 'https://x/anthropic' });

    expect(fetch.mock.calls[0]![0]).toBe('https://x/anthropic/v1/models?limit=1000');
    expect(fetch.mock.calls[0]![1].headers).toMatchObject({ 'x-api-key': 'k' });
  });

  it('lists Gemini models without the models/ prefix', async () => {
    mockFetch({ models: [{ name: 'models/gemini-x' }] });
    expect(await listModels({ apiKey: 'k', apiType: 'gemini', baseURL: 'https://g' })).toEqual([
      'gemini-x',
    ]);
  });

  it('throws on http errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 401, statusText: 'x' }));
    await expect(
      listModels({ apiKey: '', apiType: 'chat-completions', baseURL: 'https://x' }),
    ).rejects.toThrow('401');
  });
});

describe('LLMClient', () => {
  it('moves system messages to instructions', async () => {
    generateText.mockResolvedValue({ text: 'ok', usage: { totalTokens: 3 } });

    const result = await createClient().generate({
      messages: [
        { content: 'be nice', role: 'system' },
        { content: 'hi', role: 'user' },
      ],
      temperature: 0.2,
    });

    expect(result).toEqual({ text: 'ok', totalTokens: 3 });
    expect(generateText.mock.calls[0]![0]).toMatchObject({
      instructions: 'be nice',
      messages: [{ content: 'hi', role: 'user' }],
      temperature: 0.2,
    });
  });

  it('retries without sampling params when the model rejects them', async () => {
    generateText
      .mockRejectedValueOnce(
        Object.assign(new Error('Unsupported value: temperature'), { statusCode: 400 }),
      )
      .mockResolvedValueOnce({ text: 'ok', usage: {} });

    await createClient().generate({ messages: [], temperature: 0.5, topP: 1 });

    expect(generateText).toHaveBeenCalledTimes(2);
    expect(generateText.mock.calls[1]![0]).not.toHaveProperty('temperature');
    expect(generateText.mock.calls[1]![0]).not.toHaveProperty('topP');
  });

  it('does not send topP together with temperature to Anthropic', async () => {
    generateText.mockResolvedValue({ text: 'ok', usage: {} });
    await createClient('anthropic').generate({ messages: [], temperature: 0, topP: 1 });
    expect(generateText.mock.calls[0]![0].topP).toBeUndefined();
  });

  it('falls back to the raw text when JSON output fails to parse', async () => {
    generateText.mockRejectedValue(Object.assign(new Error('no object'), { text: '{bad json' }));
    expect(await createClient().generate({ json: true, messages: [] })).toEqual({
      text: '{bad json',
    });
  });

  it('streams text and surfaces stream errors', async () => {
    streamText.mockReturnValueOnce({
      fullStream: (async function* () {
        yield { text: 'he', type: 'text-delta' };
        yield { text: 'llo', type: 'text-delta' };
      })(),
      totalUsage: Promise.resolve({ totalTokens: 5 }),
    });
    const onText = vi.fn();

    expect(await createClient().stream({ messages: [] }, onText)).toEqual({
      text: 'hello',
      totalTokens: 5,
    });
    expect(onText).toHaveBeenLastCalledWith('hello');

    streamText.mockReturnValueOnce({
      fullStream: (async function* () {
        yield { error: new Error('boom'), type: 'error' };
      })(),
      totalUsage: Promise.resolve({}),
    });
    await expect(createClient().stream({ messages: [] }, vi.fn())).rejects.toThrow('boom');
  });
});
