import { describe, expect, it } from 'vitest';

import { isNumeric } from './isNumeric';

describe('isNumeric', () => {
  it('should return true for numeric strings', () => {
    expect(isNumeric('123')).toBe(true);
    expect(isNumeric('0')).toBe(true);
    expect(isNumeric('999')).toBe(true);
  });

  it('should return false for non-numeric strings', () => {
    expect(isNumeric('abc')).toBe(false);
    expect(isNumeric('12a')).toBe(false);
    expect(isNumeric('a12')).toBe(false);
    expect(isNumeric('1.23')).toBe(false);
    expect(isNumeric('-123')).toBe(false);
    expect(isNumeric('+123')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isNumeric('')).toBe(false);
  });

  it('should return false for strings with spaces', () => {
    expect(isNumeric(' 123')).toBe(false);
    expect(isNumeric('123 ')).toBe(false);
    expect(isNumeric('1 23')).toBe(false);
  });
});
