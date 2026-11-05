import { defineConfig } from 'tsdown';

export default defineConfig({
  banner: { js: '#!/usr/bin/env node' },
  deps: { onlyBundle: [] },
  entry: { cli: 'src/cli.ts' },
  fixedExtension: false,
});
