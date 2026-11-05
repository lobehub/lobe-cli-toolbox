import { loadEnv } from '@lobehub/cli-common/env';
import { resolveProviderConfig } from '@lobehub/cli-common/providers';

import type { Config, ConfigKeys } from '@/types/config';

import { config, DEFAULT_DIFF_CHUNK_TOKENS, schema } from './config';

loadEnv();
const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefaultConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) =>
  config.set(key as string, value);

const getProviderConfig = () =>
  resolveProviderConfig({
    apiKey: getConfig('openaiToken'),
    apiType: getConfig('apiType'),
    baseURL: getConfig('apiBaseUrl'),
    model: getConfig('modelName'),
    provider: getConfig('provider'),
  });

const getGithubToken = () =>
  process.env['GITHUB_TOKEN'] || process.env['GH_TOKEN'] || getConfig('githubToken');

const getDiffChunkTokens = () => getConfig('diffChunkTokens') || DEFAULT_DIFF_CHUNK_TOKENS;

const getCommitConfig = (): Config => {
  const provider = getProviderConfig();
  return {
    ...(config.store as Config),
    apiBaseUrl: provider.baseURL,
    apiType: provider.apiType,
    diffChunkTokens: getDiffChunkTokens(),
    githubToken: getGithubToken(),
    modelName: provider.model,
    openaiToken: provider.apiKey,
    provider: provider.provider,
    stream: getConfig('stream'),
  };
};

export default {
  getCommitConfig,
  getConfig,
  getDefaultConfig,
  getDiffChunkTokens,
  getGithubToken,
  getProviderConfig,
  setConfig,
};
