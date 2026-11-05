import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    banner: { js: '#!/usr/bin/env node' },
    deps: { onlyBundle: [] },
    dts: false,
    entry: { cli: 'src/cli.tsx' },
    fixedExtension: false,
  },
  {
    clean: false,
    dts: true,
    entry: { index: 'src/index.ts' },
    fixedExtension: false,
    format: ['esm', 'cjs'],
  },
]);
