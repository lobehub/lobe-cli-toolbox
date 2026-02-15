import { diff as justDiff } from 'just-diff';
import { cloneDeep, unset } from 'lodash-es';

import { LocaleObj } from '@/types';
import { I18nConfig, KeyStyle } from '@/types/config';

import { setByPath } from './setByPath';

type DiffPath = string | Array<number | string>;

const hasOwnKey = (obj: LocaleObj, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

const resolveDiffPath = (source: LocaleObj, path: DiffPath, keyStyle: KeyStyle): DiffPath => {
  if (Array.isArray(path)) {
    if (keyStyle === 'flat') {
      return [path.join('.')];
    }
    if (keyStyle === 'auto') {
      const joinedPath = path.join('.');
      if (hasOwnKey(source, joinedPath)) return [joinedPath];
    }
    return path;
  }

  if (keyStyle === 'flat') return [path];
  if (keyStyle === 'auto' && hasOwnKey(source, path)) return [path];
  return path;
};

export const diff = (
  entry: LocaleObj,
  target: LocaleObj,
  config?: Pick<I18nConfig, 'keyStyle'>,
) => {
  const keyStyle = config?.keyStyle ?? 'nested';
  const diffResult = justDiff(target, entry);
  const add = diffResult.filter((item) => item.op === 'add');
  const remove = diffResult.filter((item) => item.op === 'remove');

  const cloneTarget = cloneDeep(target);
  const extra: LocaleObj = {};

  for (const item of remove) {
    const path = resolveDiffPath(target, item.path as DiffPath, keyStyle);
    unset(cloneTarget, path);
  }

  for (const item of add) {
    const path = resolveDiffPath(entry, item.path as DiffPath, keyStyle);
    // Use custom setByPath to preserve numeric string keys as object keys
    const pathArray = Array.isArray(path) ? path : [path];
    setByPath(extra, pathArray, item.value);
  }

  return {
    add,
    entry: extra,
    remove,
    target: cloneTarget,
  };
};
