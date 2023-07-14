import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { cosmiconfigSync } from 'cosmiconfig';

import { I18nConfig, OptionKeys } from '@/types/config';

const explorer = cosmiconfigSync('i18n');

const checkOptionKeys = (opt: I18nConfig, key: OptionKeys) => {
  if (!opt[key]) {
    alert.error(`Can't find ${chalk.bold.yellow('outputLocales')} in config`);
  }
};
export const getConfigFile = (): I18nConfig | void => {
  const config: any = explorer.search()?.config;
  if (!config) return alert.error(`Can't find ${chalk.bold.yellow('config')}`, true);
  checkOptionKeys(config, 'entry');
  checkOptionKeys(config, 'entryLocale');
  checkOptionKeys(config, 'output');
  checkOptionKeys(config, 'outputLocales');
  return config;
};
