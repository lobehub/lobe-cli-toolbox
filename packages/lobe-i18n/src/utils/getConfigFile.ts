import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';

import { Options } from '@/types/options';

const CONFIG_NAME = 'i18n.config.json';
export default (): Options => {
  const configPath = resolve(__dirname, CONFIG_NAME);
  const isExist = fs.existsSync(configPath);
  if (!isExist) {
    alert.error(`Can't find ${chalk.bold.yellow(CONFIG_NAME)} in dir`);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8')) as Options;
  if (!config.entry) {
    alert.error(`Can't find ${chalk.bold.yellow('entry')} in ${CONFIG_NAME}`);
  }
  if (!config.entryLocale) {
    alert.error(`Can't find ${chalk.bold.yellow('entryLocale')} in ${CONFIG_NAME}`);
  }
  if (!config.output) {
    alert.error(`Can't find ${chalk.bold.yellow('output')} in ${CONFIG_NAME}`);
  }
  if (!config.outputLocales) {
    alert.error(`Can't find ${chalk.bold.yellow('outputLocales')} in ${CONFIG_NAME}`);
  }
  return config;
};
