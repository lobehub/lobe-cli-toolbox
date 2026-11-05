import { isPlainObject } from 'lodash-es';

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

/**
 * Packs entries into chunks of at most `splitToken` tokens. A nested namespace that does not fit
 * into one chunk on its own is split recursively, each part keeps the namespace key so the
 * chunks deep-merge back into the original shape.
 */
const splitJSONtoSmallChunks = (object: LocaleObj, splitToken: number): LocaleObj[] => {
  const chunks: LocaleObj[] = [];
  let chunk: LocaleObj = {};
  let chunkSize = OBJECT_EXTRA_TOKENS;

  const flush = () => {
    if (Object.keys(chunk).length > 0) chunks.push(chunk);
    chunk = {};
    chunkSize = OBJECT_EXTRA_TOKENS;
  };

  for (const [key, value] of Object.entries(object)) {
    const keySize = calcEncodedKeyToken(key) + KEY_EXTRA_TOKENS;
    const nested = isPlainObject(value);
    const itemSize =
      keySize + (nested ? calcJsonToken(value as LocaleObj, 1) : calcPrimitiveValueToken(value));

    if (chunkSize + itemSize <= splitToken) {
      chunk[key] = value;
      chunkSize += itemSize;
      continue;
    }

    flush();

    if (nested && OBJECT_EXTRA_TOKENS + itemSize > splitToken) {
      const innerToken = splitToken - keySize - OBJECT_EXTRA_TOKENS;
      for (const part of splitJSONtoSmallChunks(value as LocaleObj, innerToken)) {
        chunks.push({ [key]: part });
      }
      continue;
    }

    chunk[key] = value;
    chunkSize += itemSize;
  }

  flush();
  return chunks;
};

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
  return splitJSONtoSmallChunks(extraJSON, getSplitToken(config));
};
