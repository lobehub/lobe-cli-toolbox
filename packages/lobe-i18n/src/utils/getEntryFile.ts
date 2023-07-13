import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import fs from 'node:fs';
import { resolve } from 'node:path';
import * as process from 'node:process';

import { LocaleFolderObj, LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export const getEntryFile = (config: I18nConfig): LocaleObj | void => {
  try {
    const entryPath = resolve('./', config.entry);
    const isExist = fs.existsSync(entryPath);
    if (!isExist) {
      alert.error(`Can't find ${chalk.bold.yellow(config.entry)} in dir`);
    }
    const entry = JSON.parse(fs.readFileSync(entryPath, 'utf8')) as LocaleObj;

    return entry;
  } catch {
    process.exit(1);
  }
};

export const getEntryFolderFiles = (config: I18nConfig): LocaleFolderObj | void => {
  const entryPath = config.entry.replace('*', '');
  try {
    const files = fs.readdirSync(entryPath).filter((name) => name.includes('.json'));
    const obj: LocaleFolderObj = {};

    if (files.length === 0) {
      alert.error(`Can't find ${chalk.bold.yellow(entryPath)} in dir`);
    }

    for (const file of files) {
      const filePath = resolve(entryPath, file);
      const content = fs.readFileSync(filePath, 'utf8');
      obj[file] = JSON.parse(content);
    }
    return obj;
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};
