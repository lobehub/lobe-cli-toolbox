import { encode } from 'gpt-tokenizer';
import { isPlainObject, reduce, sumBy } from 'lodash-es';

import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

import { diffJson } from './diffJson';

const PRIMITIVE_EXTRA_TOKENS = 3;
const KEY_EXTRA_TOKENS = 2; // For `"key":`
const OBJECT_EXTRA_TOKENS = 2; // For `{}`

// Function to calculate the size of encoded key
const getEncodedKeySize = (key: string): number => encode(String(key)).length;

// Function to calculate token size of primitive value
const getPrimitiveValueSize = (value: any): number =>
  getEncodedKeySize(value) + PRIMITIVE_EXTRA_TOKENS;

// Function to calculate token size of JSON object
const getJSONTokenSize = (object: LocaleObj, depth = 0): number =>
  sumBy(
    Object.entries(object),
    ([key, value]: [string, any]) =>
      getEncodedKeySize(key) +
      KEY_EXTRA_TOKENS +
      (isPlainObject(value) ? getJSONTokenSize(value, depth + 1) : getPrimitiveValueSize(value)),
  ) +
  OBJECT_EXTRA_TOKENS +
  depth;

const splitJSONtoSmallChunks = (object: LocaleObj, splitToken: number = 2000) =>
  reduce(
    Object.entries(object),
    (chunks: any[], [key, value]: [string, any]) => {
      let [chunk, chunkSize]: [LocaleObj, number] = chunks.pop() || [{}, OBJECT_EXTRA_TOKENS];
      const nextValueSize = isPlainObject(value)
        ? getJSONTokenSize(value, 1)
        : getPrimitiveValueSize(value);
      if (chunkSize + getEncodedKeySize(key) + KEY_EXTRA_TOKENS + nextValueSize <= splitToken) {
        chunk[key] = value;
        chunkSize += getEncodedKeySize(key) + KEY_EXTRA_TOKENS + nextValueSize;
        chunks.push([chunk, chunkSize]);
      } else {
        chunks.push(
          [chunk, chunkSize],
          [{ [key]: value }, getEncodedKeySize(key) + KEY_EXTRA_TOKENS + nextValueSize],
        );
      }
      return chunks;
    },
    [],
  ).map(([chunk]) => chunk);

export const splitJsonToChunks = (
  config: I18nConfig,
  entry: LocaleObj,
  target: LocaleObj,
): LocaleObj[] => {
  const extraJSON = diffJson(entry, target);
  if (Object.keys(extraJSON).length === 0) return [];
  const splitObj = splitJSONtoSmallChunks(extraJSON, config.splitToken);
  return splitObj;
};
