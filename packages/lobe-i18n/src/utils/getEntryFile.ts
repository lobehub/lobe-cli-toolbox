import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { globSync } from 'glob';
import { existsSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import * as process from 'node:process';

import { LocaleFolderObj, LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';
import { readJSON } from '@/utils/fs';

export const getEntryFile = (config: I18nConfig): LocaleObj | void => {
  try {
    const entryPath = resolve('./', config.entry);
    const isExist = existsSync(entryPath);
    if (!isExist) {
      alert.error(`Can't find ${chalk.bold.yellow(config.entry)} in dir`, true);
    }
    const entry = readJSON(entryPath) as LocaleObj;

    return entry;
  } catch {
    process.exit(1);
  }
};

export const getEntryFolderFiles = (config: I18nConfig): LocaleFolderObj | void => {
  const entryPath = config.entry.replaceAll('*', '').replaceAll('*.json', '');
  const files = globSync(join(entryPath, '**/*.json'));

  const obj: LocaleFolderObj = {};

  for (const file of files) {
    obj[relative(entryPath, file)] = readJSON(file);
  }

  if (Object.keys(obj).length === 0) {
    alert.error(`Can't find .json files in ${chalk.bold.yellow(entryPath)}`, true);
    return;
  }

  return obj;
};
