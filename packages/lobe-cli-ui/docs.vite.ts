import { defineDocsVite } from '@lobehub/docs-kit/vite-extension';

import { inkDemoPlugin } from './scripts/vite-ink-demo-plugin.mjs';

/**
 * Official docs-kit consumer Vite extension (@lobehub/docs-kit >= 6.4.0).
 * - plugins prepended before kit plugins
 * - transform runs in client serve+build; SSR no-op is inside inkDemoPlugin
 * - configureServer (live Ink WS) only runs under `lobedocs dev`
 */
export default defineDocsVite({
  optimizeDeps: {
    include: ['@xterm/xterm', '@xterm/addon-fit', '@xterm/addon-unicode-graphemes'],
  },
  plugins: [inkDemoPlugin()],
});
