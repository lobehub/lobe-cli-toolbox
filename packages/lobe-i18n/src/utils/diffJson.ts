import { diff as justDiff } from 'just-diff';
import { cloneDeep, set, unset } from 'lodash-es';

import { LocaleObj } from '@/types';

export const diff = (entry: LocaleObj, target: LocaleObj) => {
  const diffResult = justDiff(target, entry);
  const add = diffResult.filter((item) => item.op === 'add');
  const remove = diffResult.filter((item) => item.op === 'remove');

  const cloneTarget = cloneDeep(target);
  const extra = {};

  for (const item of remove) {
    unset(cloneTarget, item.path);
  }

  for (const item of add) {
    set(extra, item.path, item.value);
  }

  return {
    add,
    entry: extra,
    remove,
    target: cloneTarget,
  };
};
