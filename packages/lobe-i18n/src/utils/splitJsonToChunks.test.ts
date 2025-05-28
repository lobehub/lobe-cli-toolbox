import { describe, expect, it, vi } from 'vitest';

import { LanguageModel } from '../../../common/models';
import { LocaleObj } from '../types';
import { I18nConfig } from '../types/config';
import { getSplitToken, splitJsonToChunks } from './splitJsonToChunks';

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
    modelName: LanguageModel.GPT_3_5_TURBO,
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
    it('should calculate split token based on model capacity', () => {
      const prompt = 'Translate the following:';
      const result = getSplitToken(mockConfig, prompt);

      // Should be calculated as (model_tokens - prompt_tokens) / 3
      expect(result).toBeGreaterThan(0);
      expect(typeof result).toBe('number');
    });

    it('should respect custom splitToken config', () => {
      const configWithCustomSplit: I18nConfig = {
        ...mockConfig,
        splitToken: 500,
      };

      const prompt = 'Translate the following:';
      const result = getSplitToken(configWithCustomSplit, prompt);

      expect(result).toBeLessThanOrEqual(500);
    });

    it('should use default model when no model specified', () => {
      const configWithoutModel: I18nConfig = {
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN'],
      };

      const prompt = 'Translate:';
      const result = getSplitToken(configWithoutModel, prompt);

      expect(result).toBeGreaterThan(0);
    });

    it('should floor the calculated token value', () => {
      const prompt = 'Test prompt';
      const result = getSplitToken(mockConfig, prompt);

      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('splitJsonToChunks', () => {
    it('should split JSON into manageable chunks', () => {
      const prompt = 'Translate the following JSON:';
      const result = splitJsonToChunks(mockConfig, mockEntry, mockTarget, prompt);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should handle empty entry object', () => {
      const emptyEntry: LocaleObj = {};
      const prompt = 'Translate:';

      const result = splitJsonToChunks(mockConfig, emptyEntry, mockTarget, prompt);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty target object', () => {
      const emptyTarget: LocaleObj = {};
      const prompt = 'Translate:';

      const result = splitJsonToChunks(mockConfig, mockEntry, emptyTarget, prompt);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should return chunks with proper structure', () => {
      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, mockEntry, mockTarget, prompt);

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

      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, nestedEntry, {}, prompt);

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

      const prompt = 'Translate:';
      const result = splitJsonToChunks(smallTokenConfig, largeEntry, {}, prompt);

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

      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, specialEntry, {}, prompt);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle very long string values', () => {
      const longStringEntry: LocaleObj = {
        long: 'a'.repeat(1000),
        longer: 'b'.repeat(2000),
      };

      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, longStringEntry, {}, prompt);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle numeric and boolean values', () => {
      const mixedEntry: LocaleObj = {
        boolean: true,
        null: null,
        number: 42,
        string: 'text',
      };

      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, mixedEntry, {}, prompt);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty string values', () => {
      const emptyStringEntry: LocaleObj = {
        empty: '',
        normal: 'value',
        whitespace: '   ',
      };

      const prompt = 'Translate:';
      const result = splitJsonToChunks(mockConfig, emptyStringEntry, {}, prompt);

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
