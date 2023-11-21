import { cloneDeep, unset } from 'lodash-es';

import { LocaleObj } from '@/types';
import { isEqualJsonKeys } from '@/utils/isEqualJsonKeys';

import { diffKeys } from './diffJson';

export const cleanJson = (entry: LocaleObj, target: LocaleObj) => {
  if (!target || Object.keys(target).length === 0) return {};
  if (isEqualJsonKeys(target, entry)) return target;

  const cleanKeys = diffKeys(entry, target);

  if (cleanKeys.length === 0) return target;
  const newTarget = cloneDeep(target);
  for (const key of cleanKeys) {
    unset(newTarget, key);
  }
  return newTarget;
};
