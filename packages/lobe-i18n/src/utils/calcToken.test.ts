import { describe, expect, it } from 'vitest';

import {
  KEY_EXTRA_TOKENS,
  OBJECT_EXTRA_TOKENS,
  PRIMITIVE_EXTRA_TOKENS,
  calcEncodedKeyToken,
  calcJsonToken,
  calcPrimitiveValueToken,
  calcToken,
} from './calcToken';

describe('calcToken', () => {
  describe('calcToken', () => {
    it('should calculate token count for simple strings', () => {
      const result = calcToken('hello');
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should return 0 for empty string', () => {
      const result = calcToken('');
      expect(result).toBe(0);
    });

    it('should handle unicode characters', () => {
      const result = calcToken('你好世界');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calcEncodedKeyToken', () => {
    it('should calculate token count for keys', () => {
      const result = calcEncodedKeyToken('testKey');
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should handle numeric keys', () => {
      const result = calcEncodedKeyToken('123');
      expect(result).toBeGreaterThan(0);
    });
  });

  describe('calcPrimitiveValueToken', () => {
    it('should calculate token count for primitive values', () => {
      const result = calcPrimitiveValueToken('test value');
      expect(result).toBeGreaterThan(PRIMITIVE_EXTRA_TOKENS);
    });

    it('should handle numbers', () => {
      const result = calcPrimitiveValueToken(123);
      expect(result).toBeGreaterThan(PRIMITIVE_EXTRA_TOKENS);
    });

    it('should handle booleans', () => {
      const result = calcPrimitiveValueToken(true);
      expect(result).toBeGreaterThan(PRIMITIVE_EXTRA_TOKENS);
    });
  });

  describe('calcJsonToken', () => {
    it('should calculate token count for simple object', () => {
      const obj = {
        key1: 'value1',
        key2: 'value2',
      };
      const result = calcJsonToken(obj);
      expect(result).toBeGreaterThan(OBJECT_EXTRA_TOKENS);
    });

    it('should calculate token count for nested object', () => {
      const obj = {
        level1: {
          level2: {
            key: 'value',
          },
        },
      };
      const result = calcJsonToken(obj);
      expect(result).toBeGreaterThan(OBJECT_EXTRA_TOKENS);
    });

    it('should handle empty object', () => {
      const obj = {};
      const result = calcJsonToken(obj);
      expect(result).toBe(OBJECT_EXTRA_TOKENS);
    });

    it('should handle mixed value types', () => {
      const obj = {
        boolean: true,
        nested: {
          inner: 'value',
        },
        number: 123,
        string: 'test',
      };
      const result = calcJsonToken(obj);
      expect(result).toBeGreaterThan(OBJECT_EXTRA_TOKENS);
    });

    it('should account for depth in nested objects', () => {
      const shallow = { key: 'value' };
      const deep = { level1: { level2: { key: 'value' } } };

      const shallowTokens = calcJsonToken(shallow);
      const deepTokens = calcJsonToken(deep);

      expect(deepTokens).toBeGreaterThan(shallowTokens);
    });
  });

  describe('constants', () => {
    it('should have correct constant values', () => {
      expect(PRIMITIVE_EXTRA_TOKENS).toBe(3);
      expect(KEY_EXTRA_TOKENS).toBe(2);
      expect(OBJECT_EXTRA_TOKENS).toBe(2);
    });
  });
});
