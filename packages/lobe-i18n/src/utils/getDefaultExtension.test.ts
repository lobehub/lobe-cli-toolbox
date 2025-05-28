import { describe, expect, it } from 'vitest';

import { getDefaultExtension } from './getDefaultExtension';

describe('getDefaultExtension', () => {
  it('should return correct extension for locale', () => {
    expect(getDefaultExtension('en')).toBe('.en.md');
    expect(getDefaultExtension('zh-CN')).toBe('.zh-CN.md');
    expect(getDefaultExtension('ja')).toBe('.ja.md');
    expect(getDefaultExtension('fr')).toBe('.fr.md');
  });

  it('should handle empty string', () => {
    expect(getDefaultExtension('')).toBe('..md');
  });

  it('should handle special characters in locale', () => {
    expect(getDefaultExtension('zh_CN')).toBe('.zh_CN.md');
    expect(getDefaultExtension('pt-BR')).toBe('.pt-BR.md');
  });
});
