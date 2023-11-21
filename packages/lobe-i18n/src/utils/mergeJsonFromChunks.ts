import { merge } from 'lodash-es';

import { LocaleObj } from '@/types';

export const mergeJsonFromChunks = (arr: LocaleObj[]): LocaleObj => {
  let result = {};
  for (const obj of arr) {
    result = merge(result, obj);
  }
  return result;
};
