import fs from 'node:fs';
import { resolve } from 'node:path';

import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export const getLocaleObj = (config: I18nConfig, local: string): LocaleObj => {
  const localPath = resolve(config.output, `${local}.json`);
  const file = fs.readFileSync(localPath) as any;
  if (!file) {
    fs.writeFileSync(localPath, '{}');
    return {};
  }
  return JSON.parse(file);
};

export const getLocaleFolderObj = (
  config: I18nConfig,
  local: string,
  filename: string,
): LocaleObj => {
  const localPath = resolve(config.output, local, filename);
  const file = fs.readFileSync(localPath) as any;
  if (!file) {
    fs.writeFileSync(localPath, '{}');
    return {};
  }
  return JSON.parse(file);
};
