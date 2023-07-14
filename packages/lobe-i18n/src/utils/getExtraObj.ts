import { cloneDeep, isObject } from 'lodash-es';

import { LocaleObj } from '@/types';

const compareObjects = (objA: any, objB: any): LocaleObj => {
  const obj = cloneDeep(objA);
  for (const key of Object.keys(objB)) {
    if (key && objA[key] && !isObject(objA[key])) {
      delete obj[key];
    } else if (isObject(objA[key])) {
      const result = compareObjects(objA[key], objB[key]);
      if (Object.keys(result).length === 0) {
        delete obj[key];
      } else {
        obj[key] = compareObjects(objA[key], objB[key]);
      }
    }
  }
  return obj;
};

export const getExtraObj = (entry: LocaleObj, target: LocaleObj): LocaleObj => {
  const extraObj = compareObjects(entry, target);
  return extraObj;
};
