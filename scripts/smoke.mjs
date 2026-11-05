#!/usr/bin/env node
// Runs every built CLI the way users do (`node dist/cli.js`) inside a throwaway HOME, so it
// catches bundling mistakes such as missing runtime dependencies. Run `pnpm build` first.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = new URL('../packages/', import.meta.url);
const home = mkdtempSync(join(tmpdir(), 'lobe-smoke-'));
const env = {
  ...process.env,
  APPDATA: home,
  CI: '1',
  HOME: home,
  NO_UPDATE_NOTIFIER: '1',
  USERPROFILE: home,
  XDG_CONFIG_HOME: join(home, '.config'),
};

let failures = 0;
const check = async (name, fn) => {
  try {
    await fn();
    console.log(`✔ ${name}`);
  } catch (error) {
    failures++;
    console.error(`✖ ${name}\n${error.stderr?.toString() || error.message}`);
  }
};

const run = (cli, args) =>
  execFileSync(process.execPath, [cli, ...args], { cwd: home, encoding: 'utf8', env }).trim();

try {
  for (const dir of readdirSync(root)) {
    const pkgDir = new URL(`${dir}/`, root);
    const pkg = JSON.parse(readFileSync(new URL('package.json', pkgDir), 'utf8'));
    if (pkg.private || !pkg.bin) continue;

    const cli = new URL(Object.values(pkg.bin)[0], pkgDir).pathname;

    await check(`${pkg.name} --version`, () => {
      const version = run(cli, ['--version']);
      if (version !== pkg.version) throw new Error(`expected ${pkg.version}, got "${version}"`);
    });
    await check(`${pkg.name} --help`, () => {
      if (!run(cli, ['--help']).includes('Usage:')) throw new Error('missing usage');
    });
    // The release step semantic-release runs; npm fails on `workspace:` if it sees an npm workspace.
    await check(`${pkg.name} npm version`, () => {
      execFileSync(
        'npm',
        ['version', pkg.version, '--no-git-tag-version', '--allow-same-version'],
        { cwd: pkgDir, stdio: 'pipe' },
      );
    });

    if (pkg.exports?.['.']?.import) {
      await check(`${pkg.name} ESM and CJS entry`, async () => {
        const esm = await import(new URL(pkg.exports['.'].import.default, pkgDir));
        const cjs = createRequire(pkgDir)(
          new URL(pkg.exports['.'].require.default, pkgDir).pathname,
        );
        if (typeof esm.defineConfig !== 'function' || typeof cjs.defineConfig !== 'function')
          throw new Error('defineConfig is not exported');
      });
    }
  }
} finally {
  rmSync(home, { force: true, recursive: true });
}

if (failures > 0) {
  console.error(`\n${failures} smoke check(s) failed`);
  process.exit(1);
}
