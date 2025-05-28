import { describe, expect, it } from 'vitest';

import { findObjPaths } from './findObjPaths';

describe('findObjPaths', () => {
  it('should find paths for matching feature type', () => {
    const obj = {
      item1: {
        type: 'text',
        value: 'Hello World',
      },
      item2: {
        type: 'number',
        value: 123,
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item1.value',
        value: 'Hello World',
      },
    ]);
  });

  it('should find multiple paths for same feature type', () => {
    const obj = {
      item1: {
        type: 'text',
        value: 'First text',
      },
      item2: {
        type: 'text',
        value: 'Second text',
      },
      item3: {
        type: 'number',
        value: 123,
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item1.value',
        value: 'First text',
      },
      {
        path: 'item2.value',
        value: 'Second text',
      },
    ]);
  });

  it('should handle nested objects', () => {
    const obj = {
      item2: {
        type: 'text',
        value: 'Root text',
      },
      level1: {
        level2: {
          item1: {
            type: 'text',
            value: 'Nested text',
          },
        },
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item2.value',
        value: 'Root text',
      },
      {
        path: 'level1.level2.item1.value',
        value: 'Nested text',
      },
    ]);
  });

  it('should return empty array when no matches found', () => {
    const obj = {
      item1: {
        type: 'number',
        value: 123,
      },
      item2: {
        type: 'boolean',
        value: true,
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([]);
  });

  it('should handle empty object', () => {
    const obj = {};

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([]);
  });

  it('should ignore items without value property', () => {
    const obj = {
      item1: {
        type: 'text',
        // no value property
      },
      item2: {
        type: 'text',
        value: 'Has value',
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item2.value',
        value: 'Has value',
      },
    ]);
  });

  it('should ignore items without type property', () => {
    const obj = {
      item1: {
        // no type property
        value: 'Has value but no type',
      },
      item2: {
        type: 'text',
        value: 'Has both type and value',
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item2.value',
        value: 'Has both type and value',
      },
    ]);
  });

  it('should handle null values in object', () => {
    const obj = {
      item1: null,
      item2: {
        type: 'text',
        value: 'Valid item',
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item2.value',
        value: 'Valid item',
      },
    ]);
  });

  it('should handle arrays in object structure', () => {
    const obj = {
      items: [
        {
          type: 'text',
          value: 'Array item 1',
        },
        {
          type: 'text',
          value: 'Array item 2',
        },
      ],
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'items.0.value',
        value: 'Array item 1',
      },
      {
        path: 'items.1.value',
        value: 'Array item 2',
      },
    ]);
  });

  it('should handle different value types', () => {
    const obj = {
      item1: {
        type: 'text',
        value: 'string value',
      },
      item2: {
        type: 'text',
        value: 123,
      },
      item3: {
        type: 'text',
        value: true,
      },
      item4: {
        type: 'text',
        value: null,
      },
    };

    const result = findObjPaths(obj, 'text');

    expect(result).toEqual([
      {
        path: 'item1.value',
        value: 'string value',
      },
      {
        path: 'item2.value',
        value: 123,
      },
      {
        path: 'item3.value',
        value: true,
      },
    ]);
  });

  it('should not mutate the original paths array', () => {
    const obj = {
      item1: {
        type: 'text',
        value: 'Test value',
      },
    };
    const originalPaths = [{ path: 'existing.path', value: 'existing value' }];

    const result = findObjPaths(obj, 'text', '', originalPaths);

    expect(result).toContain(originalPaths[0]);
    expect(result).toEqual([
      { path: 'existing.path', value: 'existing value' },
      { path: 'item1.value', value: 'Test value' },
    ]);
  });
});
