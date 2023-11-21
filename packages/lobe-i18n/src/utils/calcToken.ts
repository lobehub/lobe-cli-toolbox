import { encode } from 'gpt-tokenizer';
import { isPlainObject, sumBy } from 'lodash-es';

import { LocaleObj } from '@/types';

export const PRIMITIVE_EXTRA_TOKENS = 3;
export const KEY_EXTRA_TOKENS = 2; // For `"key":`
export const OBJECT_EXTRA_TOKENS = 2; // For `{}`

export const calcToken = (str: any) => {
  return encode(String(str)).length;
};

// Function to calculate the size of encoded key
export const calcEncodedKeyToken = (key: string): number => encode(String(key)).length;

// Function to calculate token size of primitive value
export const calcPrimitiveValueToken = (value: any): number =>
  calcEncodedKeyToken(value) + PRIMITIVE_EXTRA_TOKENS;

// Function to calculate token size of JSON object
export const calcJsonToken = (object: LocaleObj, depth = 0): number =>
  sumBy(
    Object.entries(object),
    ([key, value]: [string, any]) =>
      calcEncodedKeyToken(key) +
      KEY_EXTRA_TOKENS +
      (isPlainObject(value) ? calcJsonToken(value, depth + 1) : calcPrimitiveValueToken(value)),
  ) +
  OBJECT_EXTRA_TOKENS +
  depth;
