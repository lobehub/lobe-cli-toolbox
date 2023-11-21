import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';

import { OptionKeys } from '@/types/config';

export const checkOptionKeys = (opt: any, key: OptionKeys) => {
  if (!opt[key]) {
    alert.error(`Can't find ${chalk.bold.yellow('outputLocales')} in config`);
  }
};
