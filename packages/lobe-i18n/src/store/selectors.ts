import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import dotenv from 'dotenv';
import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';
import { Config, ConfigKeys, I18nConfig, MarkdownConfig } from '@/types/config';
import { checkOptionKeys } from '@/utils/checkOptionKeys';

import { config, explorer, schema } from './config';

dotenv.config();

const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
const getDefulatConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) => config.set(key, value);
const getOpenAIApiKey = () => process.env.OPENAI_API_KEY || getConfig('openaiToken');
const getOpenAIProxyUrl = () => process.env.OPENAI_PROXY_URL || getConfig('apiBaseUrl');

const getConfigFile = (): I18nConfig => {
  const config: any = explorer.search()?.config;
  // @ts-ignore
  if (!config) return alert.error(`Can't find ${chalk.bold.yellow('config')}`, true);
  return merge(DEFAULT_CONFIG, config);
};

const getLocaleConfig = (): I18nConfig => {
  const config = getConfigFile();
  checkOptionKeys(config, 'entry');
  checkOptionKeys(config, 'entryLocale');
  checkOptionKeys(config, 'output');
  checkOptionKeys(config, 'outputLocales');
  return config;
};

const getMarkdownConfigFile = (): MarkdownConfig => {
  const config = getConfigFile();
  if (!config.markdown) {
    // @ts-ignore
    return alert.error(`Can't find ${chalk.bold.yellow('config.markdown')}`, true);
  }

  const markdownConfig = merge(config?.markdown || {}, {
    entryExtension: config?.markdown?.entryExtension || '.md',
    entryLocale: config?.markdown?.entryLocale || config.entryLocale,
    outputLocales: config?.markdown?.outputLocales || config.outputLocales,
  });

  checkOptionKeys(markdownConfig, 'entry');
  checkOptionKeys(markdownConfig, 'entryLocale');
  checkOptionKeys(markdownConfig, 'outputLocales');

  return markdownConfig;
};

export default {
  getConfig,
  getConfigFile,
  getDefulatConfig,
  getLocaleConfig,
  getMarkdownConfigFile,
  getOpenAIApiKey,
  getOpenAIProxyUrl,
  setConfig,
};
