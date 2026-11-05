import { isPlainObject, reduce } from 'lodash-es';

import type { LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';

import {
  calcEncodedKeyToken,
  calcJsonToken,
  calcPrimitiveValueToken,
  KEY_EXTRA_TOKENS,
  OBJECT_EXTRA_TOKENS,
} from './calcToken';
import { diff } from './diffJson';

const splitJSONtoSmallChunks = (object: LocaleObj, splitToken: number) =>
  reduce(
    Object.entries(object),
    (chunks: any[], [key, value]: [string, any]) => {
      const [chunk, initialSize]: [LocaleObj, number] = chunks.pop() || [{}, OBJECT_EXTRA_TOKENS];
      let chunkSize = initialSize;
      const nextValueSize = isPlainObject(value)
        ? calcJsonToken(value, 1)
        : calcPrimitiveValueToken(value);
      if (chunkSize + calcEncodedKeyToken(key) + KEY_EXTRA_TOKENS + nextValueSize <= splitToken) {
        chunk[key] = value;
        chunkSize += calcEncodedKeyToken(key) + KEY_EXTRA_TOKENS + nextValueSize;
        chunks.push([chunk, chunkSize]);
      } else {
        chunks.push(
          [chunk, chunkSize],
          [{ [key]: value }, calcEncodedKeyToken(key) + KEY_EXTRA_TOKENS + nextValueSize],
        );
      }
      return chunks;
    },
    [],
  ).map(([chunk]) => chunk);

/**
 * Translated output is about as long as the input, so chunks are bounded by the
 * model's max output tokens (often 8k), not its context window.
 */
export const DEFAULT_SPLIT_TOKEN = 4000;

export const getSplitToken = (config: I18nConfig) =>
  Math.floor(config.splitToken && config.splitToken > 0 ? config.splitToken : DEFAULT_SPLIT_TOKEN);

export const splitJsonToChunks = (
  config: I18nConfig,
  entry: LocaleObj,
  target: LocaleObj,
): LocaleObj[] => {
  const extraJSON = diff(entry, target, config).entry;
  const splitToken = getSplitToken(config);
  const splitObj = splitJSONtoSmallChunks(extraJSON, splitToken);
  return splitObj;
};
