import { render } from 'ink-testing-library';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveProviderConfig } from './providers';
import ProviderSetup from './ProviderSetup';

const ENTER = '\r';
const ESC = '\u001B';
const DOWN = '\u001B[B';

const tick = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 30);
  });

const press = async (stdin: { write: (data: string) => void }, ...keys: string[]) => {
  for (const key of keys) {
    stdin.write(key);
    await tick();
  }
};

beforeEach(() => {
  for (const key of ['LOBE_PROVIDER', 'LOBE_API_TYPE', 'LOBE_API_KEY', 'DEEPSEEK_API_KEY']) {
    vi.stubEnv(key, '');
  }
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: async () => ({ data: [{ id: 'deepseek-chat' }, { id: 'deepseek-reasoner' }] }),
      ok: true,
    }),
  );
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('ProviderSetup', () => {
  it('walks through provider, protocol, base URL, key and model', async () => {
    const onSubmit = vi.fn();
    const { stdin, lastFrame } = render(
      <ProviderSetup current={resolveProviderConfig({})} onCancel={vi.fn()} onSubmit={onSubmit} />,
    );
    await tick();
    expect(lastFrame()).toContain('Anthropic');

    await press(stdin, 'd', 'e', 'e', 'p');
    expect(lastFrame()).toContain('❯ DeepSeek');

    await press(stdin, ENTER);
    expect(lastFrame()).toContain('❯ OpenAI Chat Completions');

    await press(stdin, DOWN, ENTER);
    expect(lastFrame()).toContain('https://api.deepseek.com/anthropic');

    await press(stdin, ENTER, ...'sk-test', ENTER);
    await tick();
    expect(lastFrame()).toContain('deepseek-reasoner');
    expect(vi.mocked(fetch).mock.calls[0]![0]).toBe(
      'https://api.deepseek.com/anthropic/v1/models?limit=1000',
    );

    await press(stdin, ...'reason', ENTER);

    expect(onSubmit).toHaveBeenCalledWith({
      apiKey: 'sk-test',
      apiKeyChanged: true,
      apiType: 'anthropic',
      baseURL: 'https://api.deepseek.com/anthropic',
      model: 'deepseek-reasoner',
      provider: 'deepseek',
    });
  });

  it('accepts a typed model id when the list can not be fetched', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    const onSubmit = vi.fn();
    const { stdin, lastFrame } = render(
      <ProviderSetup
        current={resolveProviderConfig({ model: 'old', provider: 'ollama' })}
        mode="model"
        onCancel={vi.fn()}
        onSubmit={onSubmit}
      />,
    );
    await tick();
    await tick();
    expect(lastFrame()).toContain('offline');

    await press(stdin, ...'qwen3:8b', ENTER);
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ model: 'qwen3:8b' }));
  });

  it('goes back with esc and cancels on the first step', async () => {
    const onCancel = vi.fn();
    const { stdin, lastFrame } = render(
      <ProviderSetup current={resolveProviderConfig({})} onCancel={onCancel} onSubmit={vi.fn()} />,
    );
    await tick();

    await press(stdin, ENTER);
    expect(lastFrame()).toContain('API type');

    await press(stdin, ESC);
    expect(lastFrame()).toContain('Search provider');
    expect(onCancel).not.toHaveBeenCalled();

    await press(stdin, ESC);
    expect(onCancel).toHaveBeenCalled();
  });
});
