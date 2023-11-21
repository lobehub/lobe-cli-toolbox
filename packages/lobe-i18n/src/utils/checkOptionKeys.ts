import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';

import { I18nConfig, OptionKeys } from '@/types/config';

export const checkOptionKeys = (opt: I18nConfig, key: OptionKeys) => {
  if (!opt[key]) {
    alert.error(`Can't find ${chalk.bold.yellow('outputLocales')} in config`);
  }
};
