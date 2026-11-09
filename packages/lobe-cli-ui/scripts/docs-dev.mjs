#!/usr/bin/env node
/**
 * Run lobedocs for lobe-cli-ui.
 * Consumer Vite plugins: docs.vite.ts via @lobehub/docs-kit/vite-extension (^6.4.0+).
 *
 * StyleX SSR note: lobedocs reuses an existing generated `react-router.config.mjs`
 * (marker line) without rewriting its target. A leftover file from a prior
 * `link:` checkout (file:///…/docs-kit/…) makes SSR load kit sources outside the
 * StyleX transform root → `Unexpected 'stylex.create' call at runtime`.
 * Always remove our generated config before spawn so lobedocs recreates it
 * against the installed package kitRoot.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const require = createRequire(path.join(pkgRoot, 'package.json'));
const lobedocs = require.resolve('@lobehub/docs-kit/bin/lobedocs.mjs');

const GENERATED_RR = path.join(pkgRoot, 'react-router.config.mjs');
const GENERATED_MARKER = '// @lobehub/docs-kit generated react-router config';
try {
  if (fs.existsSync(GENERATED_RR)) {
    const head = fs.readFileSync(GENERATED_RR, 'utf8').slice(0, 120);
    if (head.startsWith(GENERATED_MARKER)) {
      fs.unlinkSync(GENERATED_RR);
    }
  }
} catch {
  /* best-effort */
}

const child = spawn(process.execPath, [lobedocs, ...process.argv.slice(2)], {
  cwd: pkgRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: process.env.FORCE_COLOR || '3',
  },
});
child.on('exit', (code) => process.exit(code ?? 1));
