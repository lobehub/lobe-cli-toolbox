import { describe, expect, it } from 'vitest';

import { setByPath } from './setByPath';

describe('setByPath', () => {
  it('should set a simple nested value', () => {
    const obj = {};
    setByPath(obj, ['a', 'b', 'c'], 'value');
    expect(obj).toEqual({ a: { b: { c: 'value' } } });
  });

  it('should preserve numeric string keys as object keys, not array indices', () => {
    const obj = {};
    setByPath(obj, ['nodeDefs', '0', 'name'], 'First Node');
    setByPath(obj, ['nodeDefs', '1', 'name'], 'Second Node');
    setByPath(obj, ['nodeDefs', '2', 'name'], 'Third Node');

    expect(obj).toEqual({
      nodeDefs: {
        '0': { name: 'First Node' },
        '1': { name: 'Second Node' },
        '2': { name: 'Third Node' },
      },
    });

    // Verify it's an object, not an array
    expect(Array.isArray((obj as any).nodeDefs)).toBe(false);
  });

  it('should handle numeric keys at the root level', () => {
    const obj = {};
    setByPath(obj, ['0'], 'value0');
    setByPath(obj, ['1'], 'value1');

    expect(obj).toEqual({
      '0': 'value0',
      '1': 'value1',
    });

    expect(Array.isArray(obj)).toBe(false);
  });

  it('should handle mixed numeric and string keys', () => {
    const obj = {};
    setByPath(obj, ['items', '0', 'id'], 'first');
    setByPath(obj, ['items', 'abc', 'id'], 'second');
    setByPath(obj, ['items', '1', 'id'], 'third');

    expect(obj).toEqual({
      items: {
        '0': { id: 'first' },
        '1': { id: 'third' },
        'abc': { id: 'second' },
      },
    });

    expect(Array.isArray((obj as any).items)).toBe(false);
  });

  it('should overwrite existing values', () => {
    const obj = { a: { b: 'old' } };
    setByPath(obj, ['a', 'b'], 'new');
    expect(obj).toEqual({ a: { b: 'new' } });
  });

  it('should handle single-key paths', () => {
    const obj = {};
    setByPath(obj, ['key'], 'value');
    expect(obj).toEqual({ key: 'value' });
  });

  it('should handle empty path gracefully', () => {
    const obj = { existing: 'data' };
    setByPath(obj, [], 'value');
    // Should not modify the object
    expect(obj).toEqual({ existing: 'data' });
  });

  it('should create intermediate objects when path does not exist', () => {
    const obj = {};
    setByPath(obj, ['a', 'b', 'c', 'd'], 'value');
    expect(obj).toEqual({
      a: {
        b: {
          c: {
            d: 'value',
          },
        },
      },
    });
  });

  it('should replace non-object intermediate values with objects', () => {
    const obj: any = { a: 'string' };
    setByPath(obj, ['a', 'b'], 'value');
    expect(obj).toEqual({
      a: {
        b: 'value',
      },
    });
  });

  it('should handle complex nested structures with numeric keys', () => {
    const obj = {};
    setByPath(obj, ['nodeDefs', '0', 'inputs', '0', 'name'], 'input1');
    setByPath(obj, ['nodeDefs', '0', 'inputs', '1', 'name'], 'input2');
    setByPath(obj, ['nodeDefs', '1', 'outputs', '0', 'name'], 'output1');

    expect(obj).toEqual({
      nodeDefs: {
        '0': {
          inputs: {
            '0': { name: 'input1' },
            '1': { name: 'input2' },
          },
        },
        '1': {
          outputs: {
            '0': { name: 'output1' },
          },
        },
      },
    });

    // Verify all levels are objects, not arrays
    const typed = obj as any;
    expect(Array.isArray(typed.nodeDefs)).toBe(false);
    expect(Array.isArray(typed.nodeDefs['0'].inputs)).toBe(false);
    expect(Array.isArray(typed.nodeDefs['1'].outputs)).toBe(false);
  });

  it('should handle number type in path (not just numeric strings)', () => {
    const obj = {};
    setByPath(obj, ['items', 0, 'name'], 'First');
    setByPath(obj, ['items', 1, 'name'], 'Second');

    expect(obj).toEqual({
      items: {
        '0': { name: 'First' },
        '1': { name: 'Second' },
      },
    });

    expect(Array.isArray((obj as any).items)).toBe(false);
  });
});
