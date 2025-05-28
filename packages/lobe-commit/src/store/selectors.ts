import dotenv from 'dotenv';

import { Config, ConfigKeys } from '@/types/config';

import { ModelTokens } from '../../../common/models';
import { config, schema } from './config';

dotenv.config();
const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefulatConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) => config.set(key, value);
const getOpenAIApiKey = () => process.env.OPENAI_API_KEY || getConfig('openaiToken');
const getOpenAIProxyUrl = () => process.env.OPENAI_PROXY_URL || getConfig('apiBaseUrl');

const getGithubToken = () =>
  process.env.GITHUB_TOKEN || process.env.GH_TOKEN || getConfig('githubToken');
const getModelMaxToken = () => ModelTokens[getConfig('modelName')];
const getDiffChunkSize = () => {
  let defaultDiffChunkSize = getModelMaxToken() - 512;
  const diffChunkSize = getConfig('diffChunkSize');
  return defaultDiffChunkSize > diffChunkSize ? defaultDiffChunkSize : diffChunkSize;
};
const getCommitConfig = (): Config => ({
  ...(config.store as Config),
  apiBaseUrl: getOpenAIProxyUrl(),
  diffChunkSize: getDiffChunkSize(),
  githubToken: getGithubToken(),
  openaiToken: getOpenAIApiKey(),
  stream: getConfig('stream'),
});

export default {
  getCommitConfig,
  getConfig,
  getDefulatConfig,
  getGithubToken,
  getOpenAIApiKey,
  getOpenAIProxyUrl,
  setConfig,
};
