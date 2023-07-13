import fs from 'node:fs';
import { resolve } from 'node:path';

import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export const setLocaleObj = (config: I18nConfig, local: string, obj: LocaleObj): void => {
  const localPath = resolve(config.output, `${local}.json`);

  fs.writeFileSync(localPath, JSON.stringify(obj));
};

export const setLocaleFolderObj = (
  config: I18nConfig,
  local: string,
  filename: string,
  obj: LocaleObj,
): void => {
  const localPath = resolve(config.output, local, filename);
  fs.writeFileSync(localPath, JSON.stringify(obj));
};
