import { migrateConfigStore, type StoredConfig } from '@lobehub/cli-common/configMigration';
import Conf from 'conf';

export interface Config {
  githubToken: string;
}

export type ConfigKeys = keyof Config;

export interface ConfigSchemaItem {
  default: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export type ConfigSchema = {
  [key in ConfigKeys]: ConfigSchemaItem;
};

export const schema: ConfigSchema = {
  githubToken: {
    default: '',
    type: 'string',
  },
};

export const config = new Conf({
  projectName: 'lobe-label',
  schema,
});

/**
 * Brings configs written by older versions up to date, returns whether anything changed.
 */
export const migrateConfig = () => {
  const result = migrateConfigStore(config.store, {
    // Older versions shared the lobe-i18n config file by mistake.
    2: (store: StoredConfig & { githubToken?: unknown }) => {
      if (store.githubToken) return;
      const legacy = new Conf<Record<string, unknown>>({ projectName: 'lobe-i18n' });
      if (typeof legacy.get('githubToken') === 'string') {
        store.githubToken = legacy.get('githubToken');
      }
    },
  });
  if (result) config.store = result.store as typeof config.store;
  return Boolean(result?.changed);
};

export const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
export const getDefaultConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
export const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) =>
  config.set(key as string, value);

export const getGithubToken = () =>
  getConfig('githubToken') || process.env['GITHUB_TOKEN'] || process.env['GH_TOKEN'] || '';

export const useConfStore = () => {
  const store = config.store as Config;
  return {
    get: getConfig,
    getDefault: getDefaultConfig,
    set: setConfig,
    store,
  };
};
