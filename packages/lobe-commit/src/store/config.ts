import { migrateConfigStore, migrateLegacyProvider } from '@lobehub/cli-common/configMigration';
import Conf from 'conf';

import type { ConfigSchema } from '@/types/config';

import { migrateDiffChunkSize } from './migrations';

export const DEFAULT_DIFF_CHUNK_TOKENS = 32_000;

export const schema: ConfigSchema = {
  apiBaseUrl: {
    default: '',
    type: 'string',
  },
  apiType: {
    default: '',
    type: 'string',
  },
  diffChunkTokens: {
    default: DEFAULT_DIFF_CHUNK_TOKENS,
    type: 'number',
  },
  emoji: {
    default: 'emoji',
    type: 'string',
  },
  githubToken: {
    default: '',
    type: 'string',
  },
  includeWhy: {
    default: false,
    type: 'boolean',
  },
  locale: {
    default: '',
    type: 'string',
  },
  maxLength: {
    default: 100,
    type: 'number',
  },
  messageTemplate: {
    default: '$msg',
    type: 'string',
  },
  modelName: {
    default: '',
    type: 'string',
  },
  oneLineCommit: {
    default: false,
    type: 'boolean',
  },
  openaiToken: {
    default: '',
    type: 'string',
  },
  prompt: {
    default: '',
    type: 'string',
  },
  provider: {
    default: '',
    type: 'string',
  },
  stream: {
    default: true,
    type: 'boolean',
  },
  useFullGitmoji: {
    default: false,
    type: 'boolean',
  },
};

export const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});

/**
 * Brings configs written by older versions up to date, returns whether anything changed.
 */
export const migrateConfig = () => {
  const result = migrateConfigStore(config.store, {
    2: (store) => {
      migrateLegacyProvider(store);
      migrateDiffChunkSize(store);
    },
  });
  if (result) config.store = result.store as typeof config.store;
  return Boolean(result?.changed);
};
