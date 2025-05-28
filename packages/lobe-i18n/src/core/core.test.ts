import { describe, expect, it, vi } from 'vitest';

import { LanguageModel } from '../../../common/models';
import { defineConfig } from '../index';
import { MarkdownModeType } from '../types/config';

// Mock the heavy dependencies to focus on core logic
vi.mock('openai', () => ({
  default: class MockOpenAI {
    chat = {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'mocked translation' } }],
        }),
      },
    };
  },
}));

// Function for mode selection test
const modeFunction = ({ filePath }: { fileContent: string; filePath: string }) => {
  return filePath.includes('complex') ? MarkdownModeType.MDAST : MarkdownModeType.STRING;
};

describe('Core I18n Functionality', () => {
  describe('Configuration', () => {
    it('should create valid config with defineConfig', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        modelName: LanguageModel.GPT_3_5_TURBO,
        output: './locales',
        outputLocales: ['zh-CN', 'ja'],
        temperature: 0.7,
      });

      expect(config).toEqual({
        entry: './locales/en',
        entryLocale: 'en',
        modelName: LanguageModel.GPT_3_5_TURBO,
        output: './locales',
        outputLocales: ['zh-CN', 'ja'],
        temperature: 0.7,
      });
    });

    it('should handle markdown configuration', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        markdown: {
          entry: ['**/*.md'],
          includeMatter: false,
          mode: MarkdownModeType.MDAST,
          translateCode: true,
        },
        output: './locales',
        outputLocales: ['zh-CN'],
      });

      expect(config.markdown).toBeDefined();
      expect(config.markdown?.mode).toBe(MarkdownModeType.MDAST);
      expect(config.markdown?.translateCode).toBe(true);
    });

    it('should handle experimental features', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        experimental: {
          jsonMode: true,
        },
        output: './locales',
        outputLocales: ['zh-CN'],
      });

      expect(config.experimental?.jsonMode).toBe(true);
    });
  });

  describe('Configuration Validation', () => {
    it('should validate required fields', () => {
      // Test that the config type system requires essential fields
      const minimalConfig = {
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN'],
      };

      const config = defineConfig(minimalConfig);
      expect(config.entryLocale).toBe('en');
      expect(config.outputLocales).toEqual(['zh-CN']);
      expect(config.entry).toBe('./locales/en');
      expect(config.output).toBe('./locales');
    });

    it('should support optional configuration parameters', () => {
      const config = defineConfig({
        concurrency: 10,
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN'],
        reference: 'Translation context for better accuracy',
        splitToken: 2000,
        temperature: 0.5,
        topP: 0.9,
      });

      expect(config.concurrency).toBe(10);
      expect(config.temperature).toBe(0.5);
      expect(config.topP).toBe(0.9);
      expect(config.splitToken).toBe(2000);
      expect(config.reference).toBe('Translation context for better accuracy');
    });
  });

  describe('Markdown Mode Types', () => {
    it('should support both markdown modes', () => {
      expect(MarkdownModeType.MDAST).toBe('mdast');
      expect(MarkdownModeType.STRING).toBe('string');
    });

    it('should allow function-based mode selection', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        markdown: {
          entry: ['**/*.md'],
          mode: modeFunction,
        },
        output: './locales',
        outputLocales: ['zh-CN'],
      });

      expect(typeof config.markdown?.mode).toBe('function');
      if (typeof config.markdown?.mode === 'function') {
        expect(config.markdown.mode({ fileContent: '', filePath: 'complex.md' })).toBe(
          MarkdownModeType.MDAST,
        );
        expect(config.markdown.mode({ fileContent: '', filePath: 'simple.md' })).toBe(
          MarkdownModeType.STRING,
        );
      }
    });
  });

  describe('Type Safety', () => {
    it('should enforce locale string types', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN', 'ja', 'fr', 'de'],
      });

      expect(Array.isArray(config.outputLocales)).toBe(true);
      expect(config.outputLocales.length).toBe(4);
      expect(config.outputLocales).toContain('zh-CN');
      expect(config.outputLocales).toContain('ja');
    });

    it('should handle model name configuration', () => {
      const configs = [
        defineConfig({
          entry: './locales/en',
          entryLocale: 'en',
          modelName: LanguageModel.GPT_3_5_TURBO,
          output: './locales',
          outputLocales: ['zh-CN'],
        }),
        defineConfig({
          entry: './locales/en',
          entryLocale: 'en',
          modelName: LanguageModel.GPT_4,
          output: './locales',
          outputLocales: ['zh-CN'],
        }),
      ];

      // Check that modelName is set correctly for both configs
      expect(configs[0]).toHaveProperty('modelName', LanguageModel.GPT_3_5_TURBO);
      expect(configs[1]).toHaveProperty('modelName', LanguageModel.GPT_4);
    });
  });

  describe('Configuration Defaults', () => {
    it('should work with minimal configuration', () => {
      const config = defineConfig({
        entry: './locales/en',
        entryLocale: 'en',
        output: './locales',
        outputLocales: ['zh-CN'],
      });

      // Should not have required defaults, but should accept the config
      expect(config.entryLocale).toBe('en');
      expect(config.outputLocales).toEqual(['zh-CN']);
    });

    it('should preserve all provided options', () => {
      const inputConfig = {
        concurrency: 5,
        entry: './locales/en',
        entryLocale: 'en',
        experimental: {
          jsonMode: true,
        },
        markdown: {
          entry: ['docs/**/*.md'],
          includeMatter: true,
          mode: MarkdownModeType.MDAST,
          translateCode: true,
        },
        output: './locales',
        outputLocales: ['zh-CN', 'ja'],
        reference: 'Context for translation',
        splitToken: 1500,
        temperature: 0.7,
        topP: 0.9,
      };

      const config = defineConfig(inputConfig);

      // Should be identical to input
      expect(config).toEqual(inputConfig);
    });
  });
});
