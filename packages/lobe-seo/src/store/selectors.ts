import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';
import { Config, ConfigKeys, SeoConfig } from '@/types/config';
import { checkOptionKeys } from '@/utils/checkOptionKeys';

import { config, explorer, schema } from './config';

dotenv.config();

const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefulatConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) => config.set(key, value);
const getOpenAIApiKey = () => process.env.OPENAI_API_KEY || getConfig('openaiToken');
const getOpenAIProxyUrl = () => process.env.OPENAI_PROXY_URL || getConfig('apiBaseUrl');

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
  getConfig,
  getConfigFile,
  getDefulatConfig,
  getOpenAIApiKey,
  getOpenAIProxyUrl,
  getSeoConfig,
  setConfig,
};
