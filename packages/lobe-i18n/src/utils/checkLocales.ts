import fs from 'node:fs';
import { resolve } from 'node:path';

import { I18nConfig } from '@/types/config';

export const checkLocales = (config: I18nConfig) => {
  for (const filename of config.outputLocales) {
    const filePath = resolve(config.output, `${filename}.json`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '{}');
    }
  }
};

export const checkLocaleFolders = (config: I18nConfig, filenames: string[]) => {
  for (const locale of config.outputLocales) {
    const folderPath = resolve(config.output, locale);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }
  }

  for (const locale of config.outputLocales) {
    for (const filename of filenames) {
      const filePath = resolve(config.output, locale, filename);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '{}');
      }
    }
  }
};
