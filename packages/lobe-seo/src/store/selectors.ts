import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';
import { Config, ConfigKeys, SeoConfig } from '@/types/config';
import { checkOptionKeys } from '@/utils/checkOptionKeys';

import { getProviderConfigError, resolveProviderConfig } from '../../../common/providers';
import { config, explorer, schema } from './config';

dotenv.config();

const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefulatConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) => config.set(key, value);

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
  const config: any = explorer.getConfigFile();
  // @ts-ignore
  if (!config) return alert.error(`Can't find ${chalk.bold.yellow('config')}`, true);
  return merge(DEFAULT_CONFIG, config);
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
  getDefulatConfig,
  getProviderConfig,
  getSeoConfig,
  setConfig,
};
