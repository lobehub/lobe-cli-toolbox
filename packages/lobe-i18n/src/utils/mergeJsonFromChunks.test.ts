import { describe, expect, it } from 'vitest';

import { mergeJsonFromChunks } from './mergeJsonFromChunks';

describe('mergeJsonFromChunks', () => {
  it('should merge multiple objects into one', () => {
    const chunks = [{ key1: 'value1' }, { key2: 'value2' }, { key3: 'value3' }];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
    });
  });

  it('should handle overlapping keys with later values taking precedence', () => {
    const chunks = [
      { key1: 'value1', shared: 'first' },
      { key2: 'value2', shared: 'second' },
      { key3: 'value3', shared: 'third' },
    ];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
      shared: 'third',
    });
  });

  it('should handle nested objects', () => {
    const chunks = [
      {
        nested: {
          level1: { key1: 'value1' },
        },
      },
      {
        nested: {
          level1: { key2: 'value2' },
          level2: { key3: 'value3' },
        },
      },
    ];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      nested: {
        level1: {
          key1: 'value1',
          key2: 'value2',
        },
        level2: {
          key3: 'value3',
        },
      },
    });
  });

  it('should handle empty array', () => {
    const chunks: any[] = [];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({});
  });

  it('should handle array with single object', () => {
    const chunks = [{ key1: 'value1', key2: 'value2' }];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should handle empty objects in array', () => {
    const chunks = [{}, { key1: 'value1' }, {}, { key2: 'value2' }, {}];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
    });
  });

  it('should handle arrays within objects', () => {
    const chunks = [{ items: [1, 2] }, { items: [3, 4], other: 'value' }];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      items: [3, 4], // Arrays are replaced, not merged
      other: 'value',
    });
  });

  it('should handle complex nested structures', () => {
    const chunks = [
      {
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
            },
          },
        },
      },
      {
        user: {
          permissions: ['read'],
          profile: {
            age: 30,
            settings: {
              language: 'en',
            },
          },
        },
      },
    ];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      user: {
        permissions: ['read'],
        profile: {
          age: 30,
          name: 'John',
          settings: {
            language: 'en',
            theme: 'dark',
          },
        },
      },
    });
  });

  it('should handle null and undefined values', () => {
    const chunks = [
      { key1: 'value1', nullKey: null },
      { key2: 'value2', undefinedKey: undefined },
      { key3: 'value3' },
    ];

    const result = mergeJsonFromChunks(chunks);

    expect(result).toEqual({
      key1: 'value1',
      key2: 'value2',
      key3: 'value3',
      nullKey: null,
      undefinedKey: undefined,
    });
  });
});
