import { defineConfig } from 'tsdown';

/**
 * Library build for npm. Output is `lib/` (not `dist/`) because docs-kit
 * static site build already owns `packages/lobe-cli-ui/dist`.
 */
export default defineConfig({
  deps: {
    // Peers + runtime deps stay external for consumers / dual packaging.
    neverBundle: ['ink', 'react', 'react/jsx-runtime', 'chalk'],
  },
  dts: true,
  entry: { index: 'src/index.ts' },
  fixedExtension: false,
  format: ['esm'],
  outDir: 'lib',
});
