import { describe, expect, it } from 'vitest';

import { checkMdString } from './checkMdString';

describe('checkMdString', () => {
  describe('ignore list items', () => {
    it('should return true for newline characters', () => {
      expect(checkMdString('\n')).toBe(true);
      expect(checkMdString('\r\n')).toBe(true);
    });

    it('should return true for GitHub alert syntax', () => {
      expect(checkMdString('[!NOTE]')).toBe(true);
      expect(checkMdString('[!IMPORTANT]')).toBe(true);
      expect(checkMdString('[!WARNING]')).toBe(true);
      expect(checkMdString('[!CAUTION]')).toBe(true);
    });

    it('should return true for escaped GitHub alert syntax', () => {
      expect(checkMdString('\\[!NOTE]')).toBe(true);
      expect(checkMdString('\\[!IMPORTANT]')).toBe(true);
      expect(checkMdString('\\[!WARNING]')).toBe(true);
      expect(checkMdString('\\[!CAUTION]')).toBe(true);
    });

    it('should return true for escaped GitHub alert syntax with trailing backslash', () => {
      expect(checkMdString('\\[!NOTE]\\')).toBe(true);
      expect(checkMdString('\\[!IMPORTANT]\\')).toBe(true);
      expect(checkMdString('\\[!WARNING]\\')).toBe(true);
      expect(checkMdString('\\[!CAUTION]\\')).toBe(true);
    });
  });

  describe('punctuation and symbols', () => {
    it('should return true for punctuation only strings', () => {
      expect(checkMdString('.')).toBe(true);
      expect(checkMdString('!')).toBe(true);
      expect(checkMdString('?')).toBe(true);
      expect(checkMdString(',')).toBe(true);
      expect(checkMdString(';')).toBe(true);
      expect(checkMdString(':')).toBe(true);
      expect(checkMdString('...')).toBe(true);
      expect(checkMdString('!!!')).toBe(true);
    });

    it('should return true for mixed punctuation', () => {
      expect(checkMdString('!?')).toBe(true);
      expect(checkMdString('...')).toBe(true);
      expect(checkMdString('---')).toBe(true);
      expect(checkMdString('***')).toBe(true);
    });

    it('should handle brackets and parentheses', () => {
      expect(checkMdString('()')).toBe(true);
      expect(checkMdString('[]')).toBe(true);
      expect(checkMdString('{}')).toBe(true);
      // <> are symbols, should be considered as characters to ignore
      expect(checkMdString('<>')).toBe(true);
    });
  });

  describe('whitespace', () => {
    it('should return true for whitespace only strings', () => {
      expect(checkMdString(' ')).toBe(true);
      expect(checkMdString('  ')).toBe(true);
      expect(checkMdString('\t')).toBe(true);
    });

    it('should return true for punctuation with spaces', () => {
      expect(checkMdString(' . ')).toBe(true);
      expect(checkMdString(' ! ? ')).toBe(true);
      expect(checkMdString('  ...  ')).toBe(true);
    });
  });

  describe('emoji', () => {
    it('should return true for emoji only strings', () => {
      expect(checkMdString('😀')).toBe(true);
      expect(checkMdString('🎉')).toBe(true);
      expect(checkMdString('🚀')).toBe(true);
      expect(checkMdString('🔥')).toBe(true);
    });

    it('should return true for multiple emojis', () => {
      expect(checkMdString('😀🎉')).toBe(true);
      expect(checkMdString('🚀🔥💯')).toBe(true);
    });

    it('should return true for emojis with punctuation', () => {
      expect(checkMdString('😀!')).toBe(true);
      expect(checkMdString('🎉...')).toBe(true);
    });
  });

  describe('text content', () => {
    it('should return false for strings with letters', () => {
      expect(checkMdString('hello')).toBe(false);
      expect(checkMdString('Hello World')).toBe(false);
      expect(checkMdString('test')).toBe(false);
    });

    it('should return false for strings with numbers', () => {
      expect(checkMdString('123')).toBe(false);
      expect(checkMdString('test123')).toBe(false);
      expect(checkMdString('123test')).toBe(false);
    });

    it('should return false for mixed content with text', () => {
      expect(checkMdString('Hello!')).toBe(false);
      expect(checkMdString('Test...')).toBe(false);
      expect(checkMdString('Hello 😀')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(checkMdString('')).toBe(true);
    });

    it('should handle unicode characters', () => {
      expect(checkMdString('你好')).toBe(false);
      expect(checkMdString('こんにちは')).toBe(false);
      expect(checkMdString('مرحبا')).toBe(false);
    });

    it('should handle special markdown characters', () => {
      expect(checkMdString('*')).toBe(true);
      expect(checkMdString('_')).toBe(true);
      // ` is a symbol, should be considered as character to ignore
      expect(checkMdString('`')).toBe(true);
      expect(checkMdString('#')).toBe(true);
      expect(checkMdString('>')).toBe(true);
    });
  });
});
