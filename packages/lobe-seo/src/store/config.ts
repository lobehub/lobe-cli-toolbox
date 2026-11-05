import { migrateConfigStore, migrateLegacyProvider } from '@lobehub/cli-common/configMigration';
import Conf from 'conf';
import type { PublicExplorerSync } from 'cosmiconfig';
import { cosmiconfigSync } from 'cosmiconfig';

import type { ConfigSchema } from '@/types/config';

export const schema: ConfigSchema = {
  apiBaseUrl: {
    default: '',
    type: 'string',
  },
  apiType: {
    default: '',
    type: 'string',
  },
  modelName: {
    default: '',
    type: 'string',
  },
  openaiToken: {
    default: '',
    type: 'string',
  },
  provider: {
    default: '',
    type: 'string',
  },
};
export const config = new Conf({
  projectName: 'lobe-seo',
  schema,
});

/**
 * Brings configs written by older versions up to date, returns whether anything changed.
 */
export const migrateConfig = () => {
  const result = migrateConfigStore(config.store, { 2: migrateLegacyProvider });
  if (result) config.store = result.store as typeof config.store;
  return Boolean(result?.changed);
};

class ExplorerConfig {
  explorer: PublicExplorerSync;
  customConfig?: string;
  constructor() {
    this.explorer = cosmiconfigSync('seo');
  }

  loadCustomConfig(pathToConfig: string) {
    this.customConfig = pathToConfig;
  }

  getConfigFile() {
    if (this.customConfig) return this.explorer.load(this.customConfig)?.config;
    return this.explorer.search()?.config;
  }
}

export const explorer = new ExplorerConfig();
