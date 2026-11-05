import { fileURLToPath } from 'node:url';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': './src',
      // Shared components in packages/common are outside this tsconfig's path mapping.
      '@lobehub/cli-ui': fileURLToPath(new URL('../lobe-cli-ui/dist/index.js', import.meta.url)),
    },
  },
  test: {
    alias: {
      '@': './src',
    },
    globals: true,
  },
});
