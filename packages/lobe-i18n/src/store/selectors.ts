import { loadEnv } from '@lobehub/cli-common/env';
import { getProviderConfigError, resolveProviderConfig } from '@lobehub/cli-common/providers';
import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';
import type { Config, ConfigKeys, I18nConfig, MarkdownConfig } from '@/types/config';
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
  const error = getProviderConfigError(provider, chalk.bold.yellow('lobe-i18n --option'));
  if (error) alert.error(error, true);
  return provider;
};

const getConfigFile = (): I18nConfig => {
  const config = explorer.getConfigFile();
  if (!config) alert.error(`Can't find ${chalk.bold.yellow('config')}`, true);
  return merge({}, DEFAULT_CONFIG, config);
};

/**
 * With `allowInline`, a config that only has `inline` files may leave out `entry` and `output`.
 */
const getLocaleConfig = ({ allowInline = false } = {}): I18nConfig => {
  const config = getConfigFile();
  if (!allowInline || !config.inline || config.entry || config.output) {
    checkOptionKeys(config, 'entry');
    checkOptionKeys(config, 'output');
  }
  if (allowInline && config.inline) checkOptionKeys(config.inline, 'entry');
  checkOptionKeys(config, 'entryLocale');
  checkOptionKeys(config, 'outputLocales');
  return config;
};

const getMarkdownConfigFile = (): MarkdownConfig => {
  const config = getConfigFile();
  if (!config.markdown)
    return alert.error(`Can't find ${chalk.bold.yellow('config.markdown')}`, true);

  const markdownConfig = {
    ...config.markdown,
    entryLocale: config.markdown.entryLocale || config.entryLocale,
    outputLocales: config.markdown.outputLocales || config.outputLocales,
  };

  checkOptionKeys(markdownConfig, 'entry');
  checkOptionKeys(markdownConfig, 'entryLocale');
  checkOptionKeys(markdownConfig, 'outputLocales');

  return markdownConfig as MarkdownConfig;
};

export default {
  getCheckedProviderConfig,
  getConfig,
  getConfigFile,
  getDefaultConfig,
  getLocaleConfig,
  getMarkdownConfigFile,
  getProviderConfig,
  setConfig,
};
