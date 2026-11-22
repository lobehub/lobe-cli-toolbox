import { cloneDeep, isPlainObject } from 'lodash-es';

import type { LocaleObj } from '@/types';
import type { I18nConfig, KeyStyle } from '@/types/config';

import { setByPath } from './setByPath';

type PathSegment = number | string;
type DiffPath = string | PathSegment[];

type DiffOp = {
  op: 'add' | 'remove';
  path: PathSegment[];
  value?: unknown;
};

const hasOwnKey = (obj: LocaleObj, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

/** Joins the object keys before the first array index, an array leaf stays an array. */
const flattenPath = (path: PathSegment[]): PathSegment[] => {
  const index = path.findIndex((segment) => typeof segment === 'number');
  if (index === -1) return [path.join('.')];
  if (index === 0) return path;
  return [path.slice(0, index).join('.'), ...path.slice(index)];
};

const resolveDiffPath = (source: LocaleObj, path: DiffPath, keyStyle: KeyStyle): DiffPath => {
  if (Array.isArray(path)) {
    if (keyStyle === 'flat') {
      return flattenPath(path);
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

const isRecord = (value: unknown): value is LocaleObj =>
  isPlainObject(value) && !Array.isArray(value);

/**
 * Locale-aware structural diff. Value changes at an existing key or array index are ignored:
 * the target is assumed to already hold a translation, and there is no previous entry snapshot
 * to tell a source-text edit from a translated string.
 *
 * Arrays are compared by index: new tail items are added, extra tail items are truncated.
 * Inserting or deleting in the middle therefore keeps later items at their old indexes.
 */
export const diff = (
  entry: LocaleObj,
  target: LocaleObj,
  config?: Pick<I18nConfig, 'keyStyle'>,
) => {
  const keyStyle = config?.keyStyle ?? 'nested';
  const cloneTarget = cloneDeep(target);
  const add: DiffOp[] = [];
  const remove: DiffOp[] = [];

  const walk = (source: unknown, current: unknown, path: PathSegment[]) => {
    if (isRecord(source)) {
      if (!isRecord(current)) {
        add.push({ op: 'add', path, value: source });
        return;
      }

      for (const key of Object.keys(current)) {
        if (!hasOwnKey(source, key)) {
          remove.push({ op: 'remove', path: [...path, key] });
          delete current[key];
        }
      }

      for (const [key, value] of Object.entries(source)) {
        if (!hasOwnKey(current, key)) {
          add.push({ op: 'add', path: [...path, key], value });
        } else {
          walk(value, current[key], [...path, key]);
        }
      }
      return;
    }

    if (Array.isArray(source)) {
      if (!Array.isArray(current)) {
        add.push({ op: 'add', path, value: source });
        return;
      }

      if (current.length > source.length) {
        for (let index = current.length - 1; index >= source.length; index--) {
          remove.push({ op: 'remove', path: [...path, index] });
        }
        current.length = source.length;
      }

      for (let index = current.length; index < source.length; index++) {
        add.push({ op: 'add', path: [...path, index], value: source[index] });
      }

      const overlap = Math.min(source.length, current.length);
      for (let index = 0; index < overlap; index++) {
        walk(source[index], current[index], [...path, index]);
      }
    }
  };

  walk(entry, cloneTarget, []);

  const extra: LocaleObj = {};
  for (const item of add) {
    const resolved = resolveDiffPath(entry, item.path, keyStyle);
    const pathArray = Array.isArray(resolved) ? resolved : [resolved];
    setByPath(extra, pathArray, item.value);
  }

  return {
    add,
    entry: extra,
    remove,
    target: cloneTarget,
  };
};
