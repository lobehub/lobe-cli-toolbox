import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  CONFIG_VERSION_KEY,
  migrateConfigStore,
  migrateLegacyProvider,
} from '../../../common/configMigration';

const migrate = (store: Record<string, unknown>) =>
  migrateConfigStore(store, { 2: migrateLegacyProvider });

describe('migrateConfigStore', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('runs pending migrations once and records the version', () => {
    const second = vi.fn();
    const third = vi.fn((store) => {
      store.b = 2;
    });

    const result = migrateConfigStore({ a: 1 }, { 2: second, 3: third });
    expect(second).toHaveBeenCalledOnce();
    expect(result).toEqual({ changed: true, store: { [CONFIG_VERSION_KEY]: 3, a: 1, b: 2 } });

    expect(migrateConfigStore(result!.store, { 2: second, 3: third })).toBeUndefined();
    expect(second).toHaveBeenCalledOnce();
  });

  it('only bumps the version when nothing needs migrating', () => {
    const input = { apiBaseUrl: '', openaiToken: '' };
    const result = migrate(input);

    expect(result).toEqual({ changed: false, store: { ...input, [CONFIG_VERSION_KEY]: 2 } });
    expect(input).not.toHaveProperty(CONFIG_VERSION_KEY);
  });

  it('turns a stored OpenAI token into the OpenAI provider', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('OPENAI_PROXY_URL', '');

    expect(
      migrate({ apiBaseUrl: 'https://api.openai.com/v1/', openaiToken: 'sk-1' })?.store,
    ).toEqual({
      [CONFIG_VERSION_KEY]: 2,
      apiBaseUrl: 'https://api.openai.com/v1',
      apiType: 'chat-completions',
      openaiToken: 'sk-1',
      provider: 'openai',
    });
  });

  it('turns a proxy into a custom provider and keeps the legacy default model', () => {
    vi.stubEnv('OPENAI_API_KEY', '');
    vi.stubEnv('OPENAI_PROXY_URL', '');

    const { store } = migrate({ apiBaseUrl: 'https://proxy.example.com/v1', openaiToken: 'sk-1' })!;
    expect(store).toMatchObject({
      apiType: 'chat-completions',
      modelName: 'gpt-5-mini',
      provider: 'custom',
    });

    const withModel = migrate({
      apiBaseUrl: 'https://proxy.example.com/v1',
      modelName: 'gpt-4o-mini',
      openaiToken: 'sk-1',
    })!;
    expect(withModel.store.modelName).toBe('gpt-4o-mini');
  });

  it('keeps legacy configs as they are while OPENAI_* env vars override them', () => {
    vi.stubEnv('OPENAI_PROXY_URL', 'https://proxy.example.com/v1');

    const result = migrate({ apiBaseUrl: '', openaiToken: 'sk-1' })!;
    expect(result.changed).toBe(false);
    expect(result.store).not.toHaveProperty('provider');
  });

  it('leaves configs that already have a provider alone', () => {
    const input = { apiType: '', openaiToken: 'sk-1', provider: 'deepseek' };
    expect(migrate(input)?.changed).toBe(false);
  });
});
