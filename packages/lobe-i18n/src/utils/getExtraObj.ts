import { LocaleObj } from '@/types';

export const getExtraObj = (entry: LocaleObj, target: LocaleObj): LocaleObj => {
  const result = { ...entry } as LocaleObj;
  for (let key in target) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      delete result[key];
    }
  }
  return result;
};
