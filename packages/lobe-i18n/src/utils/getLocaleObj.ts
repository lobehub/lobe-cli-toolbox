import { LocaleObj } from '@/types';
import { readJSON, writeJSON } from '@/utils/fs';

export const getLocaleObj = (filename: string): LocaleObj => {
  const file = readJSON(filename) as any;
  if (!file) {
    writeJSON(filename, {});
    return {};
  }
  return file;
};
