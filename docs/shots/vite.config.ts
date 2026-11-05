import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5179,
    strictPort: true,
  },
  preview: {
    host: '127.0.0.1',
    port: 5179,
    strictPort: true,
  },
  assetsInclude: ['**/*.ansi'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
