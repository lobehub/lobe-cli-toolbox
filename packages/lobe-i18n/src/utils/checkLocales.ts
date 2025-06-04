import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { I18nConfig } from '@/types/config';
import { writeJSON } from '@/utils/fs';

export const checkLocales = (config: I18nConfig) => {
  for (const filename of config.outputLocales) {
    const filePath = resolve(config.output, `${filename}.json`);
    if (!existsSync(filePath)) {
      writeJSON(filePath, {});
    }
  }
};

export const checkLocaleFolders = (config: I18nConfig, filenames: string[]) => {
  for (const locale of config.outputLocales) {
    const folderPath = resolve(config.output, locale);
    if (!existsSync(folderPath)) {
      mkdirSync(folderPath);
    }
  }

  for (const locale of config.outputLocales) {
    for (const filename of filenames) {
      const filePath = resolve(config.output, locale, filename);
      try {
        const dirPath = dirname(filePath);
        mkdirSync(dirPath, { recursive: true });
      } catch {
        // 忽略目录已存在的错误
      }

      if (!existsSync(filePath)) {
        writeJSON(filePath, {});
      }
    }
  }
};
