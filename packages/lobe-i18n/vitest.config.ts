import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      '@': './src',
    },
  },
  test: {
    alias: {
      '@': './src',
    },
    globals: true,
  },
});
