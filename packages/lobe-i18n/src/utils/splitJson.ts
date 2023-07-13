import { encode } from 'gpt-3-encoder';

const MAX_TOKENS = 2000;

const getPrimitiveValueSize = (value: any): number => {
  return encode(value).length + 3;
};

export const isPlainObject = (obj: unknown): obj is Record<string, unknown> => {
  return Object.prototype.toString.call(obj) === '[object Object]';
};

export const getJSONTokenSize = (object: Record<string, unknown>, depth = 0): number => {
  const keys = Object.keys(object);
  const totalLength = keys.length;
  let keysLength = totalLength;
  let tokenCount = 1;

  while (keysLength > 0) {
    const key = keys[totalLength - keysLength] as string;
    const value = object[key];
    tokenCount += 1;
    tokenCount += depth * 2;
    tokenCount += encode(key).length + 2;
    tokenCount += isPlainObject(value)
      ? getJSONTokenSize(value, depth + 1)
      : getPrimitiveValueSize(value);
    keysLength--;
  }
  tokenCount += 2;
  tokenCount += depth;
  return tokenCount;
};

export const splitJSONtoSmallChunks = (object: Record<string, unknown>) => {
  const chunks: Record<string, unknown>[] = [];
  const keys = Object.keys(object);
  const totalLength = keys.length;
  let keysLength = totalLength;

  let tempChunk: Record<string, unknown> = {};
  let chunkSize = 2;
  while (keysLength > 0) {
    const key = keys[totalLength - keysLength] as string;
    const value = object[key];
    chunkSize += 1;
    chunkSize += encode(key).length + 2;
    const nextValueSize = isPlainObject(value)
      ? getJSONTokenSize(value, 1)
      : getPrimitiveValueSize(value);
    if (chunkSize + nextValueSize > MAX_TOKENS) {
      // clear temp chunk
      chunks.push({ ...tempChunk });
      tempChunk = {};
      chunkSize = 0;
      continue;
    } else {
      tempChunk[key] = value;
    }
    chunkSize += nextValueSize;
    keysLength--;
  }
  if (Object.keys(tempChunk).length > 0) {
    chunks.push(tempChunk);
  }

  return chunks;
};
