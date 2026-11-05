import { describe, expect, it } from 'vitest';

import { migrateDiffChunkSize } from './migrations';

describe('migrateDiffChunkSize', () => {
  it('drops sizes older versions derived from the model context window', () => {
    for (const diffChunkSize of [3584, 15_873, 199_488, 399_488]) {
      const store: Record<string, unknown> = { diffChunkSize, diffChunkTokens: 32_000 };
      migrateDiffChunkSize(store);
      expect(store).toEqual({ diffChunkTokens: 32_000 });
    }
  });

  it('keeps a size the user set', () => {
    const store: Record<string, unknown> = { diffChunkSize: 8000, diffChunkTokens: 32_000 };
    migrateDiffChunkSize(store);
    expect(store).toEqual({ diffChunkTokens: 8000 });
  });
});
