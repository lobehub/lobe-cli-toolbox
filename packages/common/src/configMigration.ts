import { CUSTOM_PROVIDER, defaultModel } from './providers';

export interface StoredConfig {
  [key: string]: unknown;
  apiBaseUrl?: unknown;
  apiType?: unknown;
  modelName?: unknown;
  openaiToken?: unknown;
  provider?: unknown;
}

/**
 * Mutates the store into the format of its version.
 */
export type ConfigMigration = (store: StoredConfig) => void;

export const CONFIG_VERSION_KEY = 'configVersion';

export interface ConfigMigrationResult {
  /**
   * Whether anything besides the version marker changed
   */
  changed: boolean;
  store: StoredConfig;
}

/**
 * Stores without a version were written before migrations existed and count as version 1.
 * Returns `undefined` when the store is already up to date.
 */
export const migrateConfigStore = (
  input: StoredConfig,
  migrations: Record<number, ConfigMigration>,
): ConfigMigrationResult | undefined => {
  const latest = Math.max(1, ...Object.keys(migrations).map(Number));
  const current = Number(input[CONFIG_VERSION_KEY]) || 1;
  if (current >= latest) return undefined;

  const store: StoredConfig = structuredClone(input);
  for (let version = current + 1; version <= latest; version++) migrations[version]?.(store);

  const changed = JSON.stringify(store) !== JSON.stringify(input);
  store[CONFIG_VERSION_KEY] = latest;
  return { changed, store };
};

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * v2: providers. Configs that only have `openaiToken` / `apiBaseUrl` become an explicit
 * OpenAI (or custom, for proxies) Chat Completions provider, so `--option` shows what is in use.
 */
export const migrateLegacyProvider: ConfigMigration = (store) => {
  if (store.provider || store.apiType) return;

  const token = typeof store.openaiToken === 'string' ? store.openaiToken : '';
  const baseURL = typeof store.apiBaseUrl === 'string' ? store.apiBaseUrl.trim() : '';
  if (!token && !baseURL) return;

  // These env vars only override configs without a provider, converting would silently drop them.
  const { OPENAI_API_KEY, OPENAI_PROXY_URL } = process.env;
  if (OPENAI_API_KEY || OPENAI_PROXY_URL) return;

  const normalized = baseURL.replace(/\/+$/, '');
  const isOfficial = !normalized || normalized === OPENAI_BASE_URL;

  store.provider = isOfficial ? 'openai' : CUSTOM_PROVIDER;
  store.apiType = 'chat-completions';
  store.apiBaseUrl = normalized;
  if (!isOfficial && !store.modelName) store.modelName = defaultModel;
};
