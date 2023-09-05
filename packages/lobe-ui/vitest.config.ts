import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '@': './src',
    },
    globals: true,
  },
});
