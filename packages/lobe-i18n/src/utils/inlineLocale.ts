import { isEqual, isPlainObject } from 'lodash-es';

import type { LocaleObj } from '@/types';

import { setByPath } from './setByPath';

type KeyPath = string[];

export interface InlineDocumentOptions {
  /** Keys whose values are identifiers rather than text, copied from the entry locale as is. */
  copyKeys?: string[];
  entryLocale: string;
  /** Every locale of the project, a locale node only has keys from this list. */
  locales: string[];
}

export interface InlineDocument {
  /** Writes `result` into every locale node for `locale`, returns whether the data changed. */
  apply: (locale: string, result: LocaleObj) => boolean;
  /** Untranslated strings of every locale node in the entry locale, arrays become index keyed objects. */
  entry: LocaleObj;
  /** Paths of the locale nodes, `[]` when the whole file is `{ en: …, zh: … }`. */
  nodes: KeyPath[];
  /** Existing translations for `locale` in the same shape as `entry`. */
  target: (locale: string) => LocaleObj;
}

const getByPath = (data: unknown, path: KeyPath): unknown => {
  let value = data;
  for (const key of path) value = (value as LocaleObj | undefined)?.[key];
  return value;
};

const isLocaleNode = (value: unknown, locales: Set<string>, entryLocale: string) => {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value as LocaleObj);
  return keys.includes(entryLocale) && keys.every((key) => locales.has(key));
};

/**
 * Objects whose keys are all locales and include the entry locale, e.g. the whole file
 * `{ en: {…}, zh: {…} }` or `{ name: { en: 'Data', zh: '数据' } }` at any depth.
 */
export const findLocaleNodes = (
  data: unknown,
  { entryLocale, locales }: Pick<InlineDocumentOptions, 'entryLocale' | 'locales'>,
): KeyPath[] => {
  const localeSet = new Set([entryLocale, ...locales]);
  const nodes: KeyPath[] = [];

  const walk = (value: unknown, path: KeyPath) => {
    if (isLocaleNode(value, localeSet, entryLocale)) {
      // A root node with a plain string has no key to translate it under.
      if (path.length > 0 || typeof (value as LocaleObj)[entryLocale] === 'object')
        nodes.push(path);
      return;
    }
    if (Array.isArray(value)) value.forEach((item, index) => walk(item, [...path, String(index)]));
    else if (isPlainObject(value))
      for (const [key, item] of Object.entries(value as LocaleObj)) walk(item, [...path, key]);
  };

  walk(data, []);
  return nodes;
};

/** Keeps only the strings to translate, arrays are encoded as `{ '0': …, '1': … }`. */
const encodeSource = (source: unknown, copyKeys: Set<string>): unknown => {
  if (typeof source === 'string') return source;
  if (!Array.isArray(source) && !isPlainObject(source)) return undefined;

  const encoded: LocaleObj = {};
  for (const [key, value] of Object.entries(source as LocaleObj)) {
    if (!Array.isArray(source) && copyKeys.has(key)) continue;
    const item = encodeSource(value, copyKeys);
    if (item !== undefined) encoded[key] = item;
  }
  return Object.keys(encoded).length > 0 ? encoded : undefined;
};

/**
 * Existing translations in the shape of the source. An array with a different length than the
 * source is dropped, because its items no longer line up and have to be translated again.
 */
const encodeTarget = (source: unknown, target: unknown, copyKeys: Set<string>): unknown => {
  if (typeof source === 'string') return typeof target === 'string' ? target : undefined;
  if (Array.isArray(source)) {
    if (!Array.isArray(target) || target.length !== source.length) return undefined;
  } else if (!isPlainObject(source) || !isPlainObject(target)) {
    return undefined;
  }

  const encoded: LocaleObj = {};
  for (const [key, value] of Object.entries(source as LocaleObj)) {
    if (!Array.isArray(source) && copyKeys.has(key)) continue;
    const item = encodeTarget(value, (target as LocaleObj)[key], copyKeys);
    if (item !== undefined) encoded[key] = item;
  }
  return Object.keys(encoded).length > 0 ? encoded : undefined;
};

/**
 * Builds the translated value from the source shape: copied keys, numbers and booleans come from
 * the source, strings from `translated`. Returns `undefined` while a string is still missing,
 * an array is only written once every item is complete.
 */
const decode = (source: unknown, translated: unknown, copyKeys: Set<string>): unknown => {
  if (typeof source === 'string') return typeof translated === 'string' ? translated : undefined;
  const parts = isPlainObject(translated) ? (translated as LocaleObj) : {};

  if (Array.isArray(source)) {
    const items = source.map((item, index) => decode(item, parts[String(index)], copyKeys));
    return items.includes(undefined) ? undefined : items;
  }

  if (isPlainObject(source)) {
    const result: LocaleObj = {};
    for (const [key, value] of Object.entries(source as LocaleObj)) {
      const item = copyKeys.has(key) ? value : decode(value, parts[key], copyKeys);
      if (item !== undefined) result[key] = item;
    }
    return result;
  }

  return source;
};

const putSlot = (obj: LocaleObj, path: KeyPath, value: unknown) => {
  if (value === undefined) return;
  if (path.length === 0) Object.assign(obj, value);
  else setByPath(obj, path, value);
};

/**
 * Translates JSON files that keep every locale side by side. `data` is mutated by `apply`, so
 * several target locales can share one document and write the same file.
 */
export const createInlineDocument = (
  data: unknown,
  options: InlineDocumentOptions,
): InlineDocument => {
  const { entryLocale } = options;
  const copyKeys = new Set(options.copyKeys);
  const nodes = findLocaleNodes(data, options);
  const nodeAt = (path: KeyPath) => getByPath(data, path) as LocaleObj;

  const entry: LocaleObj = {};
  for (const path of nodes) putSlot(entry, path, encodeSource(nodeAt(path)[entryLocale], copyKeys));

  return {
    apply: (locale, result) => {
      let changed = false;
      for (const path of nodes) {
        const node = nodeAt(path);
        const source = node[entryLocale];
        const value = decode(
          source,
          path.length === 0 ? result : getByPath(result, path),
          copyKeys,
        );
        if (value === undefined || isEqual(node[locale], value)) continue;
        node[locale] = value;
        changed = true;
      }
      return changed;
    },
    entry,
    nodes,
    target: (locale) => {
      const target: LocaleObj = {};
      for (const path of nodes) {
        const node = nodeAt(path);
        putSlot(target, path, encodeTarget(node[entryLocale], node[locale], copyKeys));
      }
      return target;
    },
  };
};

export const stringifyInlineJSON = (data: unknown) => JSON.stringify(data, null, 2) + '\n';
