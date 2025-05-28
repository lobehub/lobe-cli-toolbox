import { describe, expect, it } from 'vitest';

import { isEqualJsonKeys } from './isEqualJsonKeys';

describe('isEqualJsonKeys', () => {
  it('should return true for identical objects', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(true);
  });

  it('should return true for same reference', () => {
    const obj = { a: 1, b: 2 };

    expect(isEqualJsonKeys(obj, obj)).toBe(true);
  });

  it('should return false for objects with same keys but different values', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 'different', b: 'values' };

    // The function actually compares structure recursively, not just keys
    expect(isEqualJsonKeys(obj1, obj2)).toBe(false);
  });

  it('should return false for objects with different keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, c: 2 };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(false);
  });

  it('should return false for objects with different number of keys', () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2, c: 3 };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(false);
  });

  it('should return true for objects with same structure', () => {
    const obj1 = {
      a: 1,
      nested: { x: 1, y: 2 },
    };
    const obj2 = {
      a: 1,
      nested: { x: 1, y: 2 },
    };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(true);
  });

  it('should return false for nested objects with different keys', () => {
    const obj1 = {
      a: 1,
      nested: { x: 1, y: 2 },
    };
    const obj2 = {
      a: 1,
      nested: { x: 1, z: 2 },
    };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(false);
  });

  it('should handle empty objects', () => {
    expect(isEqualJsonKeys({}, {})).toBe(true);
  });

  it('should handle primitive values', () => {
    expect(isEqualJsonKeys(1, 1)).toBe(true);
    expect(isEqualJsonKeys('string', 'string')).toBe(true);
    expect(isEqualJsonKeys(true, true)).toBe(true);
    expect(isEqualJsonKeys(null, null)).toBe(true);
  });

  it('should return false for different primitive types', () => {
    expect(isEqualJsonKeys(1, '1')).toBe(false);
    expect(isEqualJsonKeys(true, 1)).toBe(false);
    expect(isEqualJsonKeys(null, undefined)).toBe(false);
  });

  it('should handle arrays', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2, 3];

    expect(isEqualJsonKeys(arr1, arr2)).toBe(true);
  });

  it('should return false for arrays with different lengths', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [1, 2];

    expect(isEqualJsonKeys(arr1, arr2)).toBe(false);
  });

  it('should return false for mixed object and array structures with different values', () => {
    const obj1 = {
      count: 2,
      items: [{ a: 1 }, { b: 2 }],
    };
    const obj2 = {
      count: 'different',
      items: [{ a: 'different' }, { b: 'values' }],
    };

    // The function compares the entire structure, not just keys
    expect(isEqualJsonKeys(obj1, obj2)).toBe(false);
  });

  it('should return false when comparing object with non-object', () => {
    expect(isEqualJsonKeys({ a: 1 }, 'string')).toBe(false);
    expect(isEqualJsonKeys({ a: 1 }, 123)).toBe(false);
    expect(isEqualJsonKeys({ a: 1 }, null)).toBe(false);
  });

  it('should return true for deeply nested structures with same values', () => {
    const obj1 = {
      level1: {
        level2: {
          level3: {
            key: 'value1',
          },
        },
      },
    };
    const obj2 = {
      level1: {
        level2: {
          level3: {
            key: 'value1',
          },
        },
      },
    };

    expect(isEqualJsonKeys(obj1, obj2)).toBe(true);
  });
});
