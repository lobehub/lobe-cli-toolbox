import { describe, expect, it } from 'vitest';

import { formatTokens, progressDetail } from './formatProgress';

describe('formatProgress', () => {
  it('formats token counts with separators', () => {
    expect(formatTokens(12_345)).toBe('12,345 tokens');
  });

  it('describes chunk progress with the estimated tokens', () => {
    expect(progressDetail(2, 5, 1200)).toBe('2/5 chunks · ~1,200 tokens');
    expect(progressDetail(0, 3)).toBe('0/3 chunks');
  });
});
