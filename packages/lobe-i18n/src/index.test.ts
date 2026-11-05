import { describe, expect, it } from 'vitest';

import { defineConfig } from './index';

describe('index', () => {
  describe('defineConfig', () => {
    it('should return the config as is', () => {
      const config = {
        entryLocale: 'en',
        modelName: 'gpt-3.5-turbo',
        outputLocales: ['zh-CN', 'ja'],
      };

      const result = defineConfig(config);

      expect(result).toEqual(config);
    });

    it('should handle partial config', () => {
      const partialConfig = {
        entryLocale: 'en',
      };

      const result = defineConfig(partialConfig);

      expect(result).toEqual(partialConfig);
    });

    it('should handle empty config', () => {
      const result = defineConfig({});

      expect(result).toEqual({});
    });
  });
});
