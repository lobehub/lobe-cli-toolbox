import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import * as process from 'node:process';

import { I18nConfig, OptionKeys } from '@/types/config';

const CONFIG_NAME = 'i18n.config.json';

const checkOptionKeys = (opt: I18nConfig, key: OptionKeys) => {
  if (!opt[key]) {
    alert.error(`Can't find ${chalk.bold.yellow('outputLocales')} in ${CONFIG_NAME}`);
  }
};
export const getConfigFile = (): I18nConfig | void => {
  try {
    const configPath = resolve('./', CONFIG_NAME);
    const isExist = fs.existsSync(configPath);
    if (!isExist) {
      alert.error(`Can't find ${chalk.bold.yellow(CONFIG_NAME)} in dir`);
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as I18nConfig;
    checkOptionKeys(config, 'entry');
    checkOptionKeys(config, 'entryLocale');
    checkOptionKeys(config, 'output');
    checkOptionKeys(config, 'outputLocales');
    return config;
  } catch {
    process.exit(1);
  }
};
