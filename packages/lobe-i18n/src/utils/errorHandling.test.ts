import { alert } from '@lobehub/cli-ui';
import { describe, expect, it, vi } from 'vitest';

import { checkOptionKeys } from './checkOptionKeys';

// Mock the alert module
vi.mock('@lobehub/cli-ui', () => ({
  alert: {
    error: vi.fn(),
  },
}));

describe('Error Handling and Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Configuration Validation Edge Cases', () => {
    it('should handle empty object', () => {
      const opt = {};
      checkOptionKeys(opt, 'entry');
      expect(alert.error).toHaveBeenCalled();
    });

    it('should handle object with wrong key types', () => {
      // Numbers are truthy in JavaScript, so this won't trigger error
      const opt = {
        entry: 123, // This is truthy, so no error expected
      };
      checkOptionKeys(opt, 'entry');
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle deeply nested invalid configurations', () => {
      const opt = {
        nested: {
          entry: null,
        },
      };
      checkOptionKeys(opt, 'entry');
      expect(alert.error).toHaveBeenCalled();
    });

    it('should validate different option keys correctly', () => {
      const validOpt = {
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN'],
      };

      // Test each required field
      checkOptionKeys(validOpt, 'entry');
      checkOptionKeys(validOpt, 'entryLocale');
      checkOptionKeys(validOpt, 'output');
      checkOptionKeys(validOpt, 'outputLocales');

      expect(alert.error).not.toHaveBeenCalled();
    });
  });

  describe('String and Array Validation', () => {
    it('should handle falsy values correctly', () => {
      // JavaScript treats [] as truthy even though it's "empty"
      // Only these values are truly falsy: null, undefined, ''
      const falsyValues = [null, undefined, ''];

      falsyValues.forEach((value) => {
        const opt = { testKey: value };
        checkOptionKeys(opt, 'testKey' as any);
      });

      // Should have called error for each truly invalid falsy value
      expect(alert.error).toHaveBeenCalledTimes(falsyValues.length);
    });

    it('should handle empty string specifically', () => {
      vi.clearAllMocks(); // Clear previous mock calls

      const emptyOpt = {
        entry: '',
      };

      checkOptionKeys(emptyOpt, 'entry');

      expect(alert.error).toHaveBeenCalledTimes(1);
    });

    it('should validate empty array behavior', () => {
      vi.clearAllMocks(); // Clear previous mock calls

      // Empty arrays are truthy in JavaScript, so they pass validation
      const emptyOpt = {
        outputLocales: [],
      };

      checkOptionKeys(emptyOpt, 'outputLocales');

      // Empty array is truthy, so no error expected
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle whitespace-only strings', () => {
      vi.clearAllMocks(); // Clear previous mock calls

      const whitespaceOpt = {
        entry: '   ',
        entryLocale: '\t\n',
      };

      checkOptionKeys(whitespaceOpt, 'entry');
      checkOptionKeys(whitespaceOpt, 'entryLocale');

      // Current implementation treats whitespace as truthy, so no errors
      expect(alert.error).not.toHaveBeenCalled();
    });
  });

  describe('Type Safety Edge Cases', () => {
    it('should handle objects with prototype pollution attempts', () => {
      const maliciousOpt = {
        __proto__: { entry: 'hacked' },
        constructor: { entry: 'hacked' },
        entry: 'legitimate',
      };

      checkOptionKeys(maliciousOpt, 'entry');
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle circular references safely', () => {
      const circularOpt: any = {
        entry: './locales',
      };
      circularOpt.self = circularOpt;

      checkOptionKeys(circularOpt, 'entry');
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle symbols and non-string keys', () => {
      const symbolKey = Symbol('entry');
      const opt = {
        entry: 'normal',
        [symbolKey]: 'value',
      };

      checkOptionKeys(opt, 'entry');
      expect(alert.error).not.toHaveBeenCalled();
    });
  });

  describe('Configuration Boundary Conditions', () => {
    it('should handle extremely long strings', () => {
      const longString = 'a'.repeat(10_000);
      const opt = {
        entry: longString,
        entryLocale: longString,
      };

      checkOptionKeys(opt, 'entry');
      checkOptionKeys(opt, 'entryLocale');
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle large arrays', () => {
      const largeArray = Array.from({ length: 1000 }).fill('locale');
      const opt = {
        outputLocales: largeArray,
      };

      checkOptionKeys(opt, 'outputLocales');
      expect(alert.error).not.toHaveBeenCalled();
    });

    it('should handle special characters in paths', () => {
      const specialPaths = [
        './locales/中文',
        './locales/日本語',
        './locales/français',
        './locales/عربي',
        './locales/with spaces',
        './locales/with-dashes',
        './locales/with_underscores',
        './locales/with.dots',
      ];

      specialPaths.forEach((path) => {
        const opt = { entry: path };
        checkOptionKeys(opt, 'entry');
      });

      expect(alert.error).not.toHaveBeenCalled();
    });
  });

  describe('Error Message Quality', () => {
    it('should provide descriptive error messages', () => {
      const opt = {};
      checkOptionKeys(opt, 'outputLocales');

      expect(alert.error).toHaveBeenCalledWith(expect.stringContaining("Can't find"));
      expect(alert.error).toHaveBeenCalledWith(expect.stringContaining('outputLocales'));
    });

    it('should handle different option keys in error messages', () => {
      const opt = {};
      const keys = ['entry', 'entryLocale', 'output', 'outputLocales'] as const;

      keys.forEach((key) => {
        checkOptionKeys(opt, key);
      });

      expect(alert.error).toHaveBeenCalledTimes(keys.length);
    });
  });
});
