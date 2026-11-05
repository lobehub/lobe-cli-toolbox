import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';

import type { OptionKeys } from '@/types/config';

const isMissing = (value: unknown) =>
  value === undefined ||
  value === null ||
  value === '' ||
  (Array.isArray(value) && value.length === 0);

/** Exits with an error when a required config option is missing or empty. */
export const checkOptionKeys = (opt: object, key: OptionKeys) => {
  if (isMissing((opt as Record<string, unknown>)[key]))
    alert.error(`Can't find ${chalk.bold.yellow(key)} in config`, true);
};
