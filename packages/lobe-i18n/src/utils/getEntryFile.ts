import chalk from 'chalk';
import { consola } from 'consola';
import { existsSync, readdirSync, statSync } from 'node:fs';
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
      consola.error(`Can't find ${chalk.bold.yellow(config.entry)} in dir`);
    }
    const entry = readJSON(entryPath) as LocaleObj;

    return entry;
  } catch {
    process.exit(1);
  }
};

export const getEntryFolderFiles = (config: I18nConfig): LocaleFolderObj | void => {
  const entryPath = config.entry.replace('*', '');

  const readLocaleFiles = (dir: string, obj: LocaleFolderObj) => {
    try {
      const items = readdirSync(dir);

      for (const item of items) {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory()) {
          readLocaleFiles(fullPath, obj); // 递归调用处理子目录
        } else if (item.endsWith('.json')) {
          obj[relative(entryPath, fullPath)] = readJSON(fullPath); // 读取文件内容
        }
      }
    } catch (error) {
      consola.error(error);
      process.exit(1);
    }
  };

  const obj: LocaleFolderObj = {};
  readLocaleFiles(entryPath, obj);

  if (Object.keys(obj).length === 0) {
    consola.error(`Can't find .json files in ${chalk.bold.yellow(entryPath)}`);
    return;
  }

  return obj;
};
