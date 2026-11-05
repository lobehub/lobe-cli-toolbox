import type { StoredConfig } from '@lobehub/cli-common/configMigration';

/**
 * Values older versions stored automatically: context window of the default model minus 512.
 */
const AUTO_DIFF_CHUNK_SIZES = new Set([3584, 15_873, 199_488, 399_488]);

/**
 * `diffChunkSize` was derived from the model context window, keep it only if the user changed it.
 */
export const migrateDiffChunkSize = (
  store: StoredConfig & { diffChunkSize?: unknown; diffChunkTokens?: unknown },
) => {
  const size = store.diffChunkSize;
  delete store.diffChunkSize;
  if (typeof size === 'number' && size > 0 && !AUTO_DIFF_CHUNK_SIZES.has(size)) {
    store.diffChunkTokens = size;
  }
};
