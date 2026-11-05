import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { chromium } from 'playwright';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.resolve(root, 'out');
const fixturesDir = path.resolve(root, 'fixtures');
const HOST = '127.0.0.1';
const PORT = 5179;

/**
 * Generous viewport — never shrink to content size (that reflows rails / Grainient).
 * When using snapdom, keep DPR=1 so layout matches the browser preview; snapdom scale handles sharpness.
 */
const VIEW_W = 1600;
const VIEW_H = 1200;
const SNAP_SCALE = Number(process.env.SHOT_SCALE || 3) || 3;
/** snapdom (default) | playwright */
const ENGINE = (process.env.SHOT_ENGINE || 'snapdom').toLowerCase();

function usage() {
  console.log(`Usage:
  node scripts/shot.mjs [path/to/file.ansi]
  pnpm shot -- fixtures/commit-type.ansi
  SHOT_SCENE=commit-type pnpm shot
  SHOT_ENGINE=snapdom|playwright pnpm shot

Reads ANSI → live Vite preview → PNG ([data-shot]) → WebP @ 1920w.
Default capture engine: SnapDOM in-page (DOM→PNG). Falls back to Playwright element screenshot on failure.
`);
}

function parseArgs(argv) {
  const args = argv.slice(2).filter((a) => a !== '--');
  if (args.includes('-h') || args.includes('--help')) {
    usage();
    process.exit(0);
  }
  const ansiArg = args.find((a) => !a.startsWith('-')) || '';
  return { ansiArg };
}

function probeServer(url, timeoutMs = 800) {
  return new Promise((resolve) => {
    const req = http.get(url, { timeout: timeoutMs }, (res) => {
      res.resume();
      resolve(Boolean(res.statusCode && res.statusCode < 500));
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServer() {
  const base = `http://${HOST}:${PORT}/`;
  if (await probeServer(base)) {
    console.log(`[shot] reuse existing Vite at ${base}`);
    return { close: async () => {}, base };
  }

  const server = await createServer({
    root,
    configFile: path.resolve(root, 'vite.config.ts'),
    server: { host: HOST, port: PORT, strictPort: true },
  });
  await server.listen();
  console.log(`[shot] started Vite at ${base}`);
  return {
    base,
    close: async () => {
      await server.close();
    },
  };
}

function runToWebp(sceneName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.resolve(__dirname, 'to-webp.mjs'), sceneName], {
      cwd: root,
      env: process.env,
      stdio: 'inherit',
    });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`to-webp.mjs exited ${code}`));
    });
  });
}

async function resolveAnsiInput(ansiArg) {
  const envScene = process.env.SHOT_SCENE || '';
  let abs;
  let scene;

  if (ansiArg) {
    abs = path.isAbsolute(ansiArg) ? ansiArg : path.resolve(process.cwd(), ansiArg);
    scene = path.basename(abs).replace(/\.ansi$/i, '');
  } else if (envScene) {
    scene = envScene;
    abs = path.resolve(fixturesDir, `${scene}.ansi`);
  } else {
    scene = 'commit-type';
    abs = path.resolve(fixturesDir, 'commit-type.ansi');
  }

  await fs.access(abs);

  const relToRoot = path.relative(root, abs);
  let srcUrl;
  if (!relToRoot.startsWith('..') && !path.isAbsolute(relToRoot)) {
    srcUrl = '/' + relToRoot.split(path.sep).join('/');
  } else {
    const stageDir = path.resolve(fixturesDir, '.shot-input');
    await fs.mkdir(stageDir, { recursive: true });
    const staged = path.resolve(stageDir, `${scene}.ansi`);
    await fs.copyFile(abs, staged);
    srcUrl = `/fixtures/.shot-input/${scene}.ansi`;
    console.log(`[shot] staged outside ansi → ${srcUrl}`);
  }

  return { abs, scene, srcUrl };
}

async function waitReady(page) {
  await page.waitForSelector('[data-shot][data-ready="1"]', { timeout: 30_000 });
  await page
    .waitForFunction(
      () => {
        const imgs = [...document.querySelectorAll('.term-fluent-emoji')];
        if (imgs.length === 0) return false;
        return imgs.every((img) => img.complete && img.naturalWidth > 0);
      },
      { timeout: 45_000 },
    )
    .catch(() => console.warn('[shot] emoji images not all ready; continuing'));
  await page.waitForTimeout(600);
}

async function captureWithSnapdom(page, outFile) {
  const ready = await page.evaluate(() => typeof window.__shotsCapture === 'function');
  if (!ready) {
    throw new Error('window.__shotsCapture missing — is src/lib/captureShot installed?');
  }

  const result = await page.evaluate(async (scale) => {
    // Hook uses fixed SCALE internally; pass selector only.
    void scale;
    return window.__shotsCapture('[data-shot]');
  }, SNAP_SCALE);

  if (!result || !result.ok) {
    throw new Error(result?.error || 'snapdom capture failed');
  }

  for (const w of result.warnings || []) {
    console.warn(`[snapdom:${w.code}] ${w.message}`);
  }

  const buf = Buffer.from(result.base64, 'base64');
  await fs.writeFile(outFile, buf);
  console.log(
    `[shot] snapdom wrote ${outFile} (${result.width}×${result.height}, ${buf.length} bytes)`,
  );
  return { engine: 'snapdom', width: result.width, height: result.height };
}

async function captureWithPlaywright(page, outFile) {
  const box = await page.locator('[data-shot]').first().boundingBox();
  if (!box) throw new Error('data-shot has no bounding box');
  console.log(
    `[shot] playwright stage css ${Math.ceil(box.width)}×${Math.ceil(box.height)} @ (${box.x},${box.y})`,
  );
  await page.locator('[data-shot]').first().screenshot({
    path: outFile,
    type: 'png',
    omitBackground: false,
  });
  console.log(`[shot] playwright wrote ${outFile}`);
  return { engine: 'playwright' };
}

async function main() {
  const { ansiArg } = parseArgs(process.argv);
  await fs.mkdir(outDir, { recursive: true });

  const { abs, scene, srcUrl } = await resolveAnsiInput(ansiArg);
  const outFile = path.resolve(outDir, `${scene}.png`);

  const server = await ensureServer();
  const url =
    `http://${HOST}:${PORT}/` +
    `?scene=${encodeURIComponent(scene)}` +
    `&src=${encodeURIComponent(srcUrl)}`;

  console.log(`[shot] engine prefer=${ENGINE}`);
  console.log(`[shot] ansi ${abs}`);
  console.log(`[shot] open ${url}`);
  console.log(`[shot] selector [data-shot] (no viewport shrink)`);

  // DPR 1 for snapdom path (match preview). Playwright fallback uses scale factor 3.
  const useDpr = ENGINE === 'playwright' ? 3 : 1;

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--enable-webgl', '--ignore-gpu-blocklist'],
  });

  try {
    const page = await browser.newPage({
      viewport: { width: VIEW_W, height: VIEW_H },
      deviceScaleFactor: useDpr,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        console.log(`[browser:${msg.type()}]`, msg.text());
      }
    });
    page.on('pageerror', (err) => console.log('[pageerror]', err.message));

    await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
    await waitReady(page);

    const box = await page.locator('[data-shot]').first().boundingBox();
    if (box) {
      console.log(
        `[shot] stage css ${Math.ceil(box.width)}×${Math.ceil(box.height)} @ (${box.x},${box.y})`,
      );
    }

    let used = ENGINE;
    if (ENGINE === 'snapdom') {
      try {
        await captureWithSnapdom(page, outFile);
      } catch (err) {
        console.warn(`[shot] snapdom failed → playwright fallback: ${err.message || err}`);
        // Recreate page at dpr 3 for sharp playwright shot
        await page.setViewportSize({ width: VIEW_W, height: VIEW_H });
        // Can't change deviceScaleFactor on existing page easily — screenshot anyway at dpr1 then note,
        // or open a new context. Prefer new context:
        await page.close();
        const page2 = await browser.newPage({
          viewport: { width: VIEW_W, height: VIEW_H },
          deviceScaleFactor: 3,
          colorScheme: 'dark',
          reducedMotion: 'reduce',
        });
        await page2.goto(url, { waitUntil: 'networkidle', timeout: 60_000 });
        await waitReady(page2);
        await captureWithPlaywright(page2, outFile);
        await page2.close();
        used = 'playwright-fallback';
      }
    } else {
      await captureWithPlaywright(page, outFile);
    }

    await runToWebp(scene);
    console.log(`[shot] done engine=${used} → out/${scene}.png + out/${scene}.webp`);
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
