import { loadEnv } from '@lobehub/cli-common/env';
import { getProviderConfigError, resolveProviderConfig } from '@lobehub/cli-common/providers';
import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';
import type { Config, ConfigKeys, SeoConfig } from '@/types/config';
import { checkOptionKeys } from '@/utils/checkOptionKeys';

import { config, explorer, schema } from './config';

loadEnv();

const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefaultConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) =>
  config.set(key as string, value);

/**
 * `modelName` from the project config file wins over the globally configured model.
 */
const getProviderConfig = (modelName?: string) =>
  resolveProviderConfig({
    apiKey: getConfig('openaiToken'),
    apiType: getConfig('apiType'),
    baseURL: getConfig('apiBaseUrl'),
    model: modelName || getConfig('modelName'),
    provider: getConfig('provider'),
  });

const getCheckedProviderConfig = (modelName?: string) => {
  const provider = getProviderConfig(modelName);
  const error = getProviderConfigError(provider, chalk.bold.yellow('lobe-seo --option'));
  if (error) alert.error(error, true);
  return provider;
};

const getConfigFile = (): SeoConfig => {
  const config = explorer.getConfigFile();
  if (!config) alert.error(`Can't find ${chalk.bold.yellow('config')}`, true);
  return merge({}, DEFAULT_CONFIG, config);
};

const getSeoConfig = (): SeoConfig => {
  const config = getConfigFile();
  checkOptionKeys(config, 'entry');
  return config;
};

export default {
  getCheckedProviderConfig,
  getConfig,
  getConfigFile,
  getDefaultConfig,
  getProviderConfig,
  getSeoConfig,
  setConfig,
};
