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

export const diffJson = (entry: LocaleObj, target: LocaleObj): LocaleObj => {
  const extraObj = compareObjects(entry, target);
  return extraObj;
};

export const diffKeys = (obj1: any, obj2: any, prefix: string = ''): string[] => {
  let result: string[] = [];
  for (const key in obj1) {
    if (!obj2[key]) continue;
    if (isObject(obj1[key]) && isObject(obj2[key])) {
      result = [...result, ...diffKeys(obj1[key], obj2[key], `${prefix}${key}.`)];
    } else if (obj1[key] !== obj2[key]) {
      result.push(`${prefix}${key}`);
    }
  }
  return result;
};
