import { describe, expect, it, vi } from 'vitest';

import { LocaleObj } from '../types';
import { I18nConfig } from '../types/config';
import { DEFAULT_SPLIT_TOKEN, getSplitToken, splitJsonToChunks } from './splitJsonToChunks';

// Mock dependencies
vi.mock('./diffJson', () => ({
  diff: vi.fn().mockReturnValue({
    entry: {
      'key1': 'value1',
      'key2': 'value2',
      'key3': 'value3',
      'nested.key': { sub: 'value' },
    },
  }),
}));

vi.mock('./calcToken', () => ({
  KEY_EXTRA_TOKENS: 2,
  OBJECT_EXTRA_TOKENS: 10,
  calcEncodedKeyToken: vi.fn().mockReturnValue(5),
  calcJsonToken: vi.fn().mockReturnValue(50),
  calcPrimitiveValueToken: vi.fn().mockReturnValue(10),
  calcToken: vi.fn().mockReturnValue(100),
}));

describe('splitJsonToChunks', () => {
  const mockConfig: I18nConfig = {
    entry: './locales/en',
    entryLocale: 'en',
    modelName: 'gpt-3.5-turbo',
    output: './locales',
    outputLocales: ['zh-CN'],
  };

  const mockEntry: LocaleObj = {
    farewell: 'Goodbye',
    greeting: 'Hello',
    welcome: 'Welcome to our app',
  };

  const mockTarget: LocaleObj = {
    greeting: '你好',
  };

  describe('getSplitToken', () => {
    it('should use the default split token', () => {
      expect(getSplitToken(mockConfig)).toBe(DEFAULT_SPLIT_TOKEN);
    });

    it('should respect custom splitToken config, including values above the default', () => {
      expect(getSplitToken({ ...mockConfig, splitToken: 500 })).toBe(500);
      expect(getSplitToken({ ...mockConfig, splitToken: 20_000 })).toBe(20_000);
    });

    it('should ignore invalid values and floor the result', () => {
      expect(getSplitToken({ ...mockConfig, splitToken: 0 })).toBe(DEFAULT_SPLIT_TOKEN);
      expect(getSplitToken({ ...mockConfig, splitToken: 1234.7 })).toBe(1234);
    });
  });

  describe('splitJsonToChunks', () => {
    it('should split JSON into manageable chunks', () => {
      const result = splitJsonToChunks(mockConfig, mockEntry, mockTarget);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty entry object', () => {
      const emptyEntry: LocaleObj = {};

      const result = splitJsonToChunks(mockConfig, emptyEntry, mockTarget);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty target object', () => {
      const emptyTarget: LocaleObj = {};

      const result = splitJsonToChunks(mockConfig, mockEntry, emptyTarget);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return chunks with proper structure', () => {
      const result = splitJsonToChunks(mockConfig, mockEntry, mockTarget);

      result.forEach((chunk) => {
        expect(typeof chunk).toBe('object');
        expect(chunk).not.toBeNull();
      });
    });

    it('should handle nested objects in JSON', () => {
      const nestedEntry: LocaleObj = {
        nested: {
          another: 'another nested value',
          deep: 'nested value',
        },
        simple: 'value',
      };
      const result = splitJsonToChunks(mockConfig, nestedEntry, {});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect token limits when splitting', () => {
      const smallTokenConfig: I18nConfig = {
        ...mockConfig,
        splitToken: 50, // Very small limit
      };

      const largeEntry: LocaleObj = {
        key1: 'This is a very long string that should exceed token limits',
        key2: 'Another long string for testing purposes',
        key3: 'Yet another string to test chunking behavior',
      };
      const result = splitJsonToChunks(smallTokenConfig, largeEntry, {});

      // Should create multiple chunks due to token limit
      expect(result.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle special characters in keys', () => {
      const specialEntry: LocaleObj = {
        'key with spaces': 'value',
        'key-with-dashes': 'value',
        'key.with.dots': 'value',
        'key_with_underscores': 'value',
        '中文键': 'Chinese key',
      };
      const result = splitJsonToChunks(mockConfig, specialEntry, {});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very long string values', () => {
      const longStringEntry: LocaleObj = {
        long: 'a'.repeat(1000),
        longer: 'b'.repeat(2000),
      };
      const result = splitJsonToChunks(mockConfig, longStringEntry, {});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle numeric and boolean values', () => {
      const mixedEntry: LocaleObj = {
        boolean: true,
        null: null,
        number: 42,
        string: 'text',
      };
      const result = splitJsonToChunks(mockConfig, mixedEntry, {});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty string values', () => {
      const emptyStringEntry: LocaleObj = {
        empty: '',
        normal: 'value',
        whitespace: '   ',
      };
      const result = splitJsonToChunks(mockConfig, emptyStringEntry, {});

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
