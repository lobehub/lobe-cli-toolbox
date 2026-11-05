/**
 * Convert shot PNGs in out/ to WebP at target width (default 1920), height adaptive.
 * Usage:
 *   node scripts/to-webp.mjs                 # all out/*.png
 *   node scripts/to-webp.mjs commit-type     # one scene basename
 *   SHOT_SCENE=commit-type node scripts/to-webp.mjs
 *   WEBP_WIDTH=1920 node scripts/to-webp.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outDir = path.resolve(root, 'out');
const WIDTH = Number(process.env.WEBP_WIDTH || 1920) || 1920;
const QUALITY = Number(process.env.WEBP_QUALITY || 90) || 90;

async function convertOne(pngPath) {
  const base = path.basename(pngPath, path.extname(pngPath));
  const webpPath = path.resolve(outDir, `${base}.webp`);
  const image = sharp(pngPath);
  const meta = await image.metadata();
  await image
    .resize({
      width: WIDTH,
      height: null,
      fit: 'inside',
      withoutEnlargement: false,
    })
    .webp({ quality: QUALITY, effort: 4 })
    .toFile(webpPath);

  const outMeta = await sharp(webpPath).metadata();
  const stat = await fs.stat(webpPath);
  console.log(
    `[to-webp] ${path.basename(pngPath)} ${meta.width}×${meta.height}` +
      ` → ${path.basename(webpPath)} ${outMeta.width}×${outMeta.height}` +
      ` (${stat.size} bytes, q=${QUALITY})`,
  );
  return { webpPath, width: outMeta.width, height: outMeta.height, size: stat.size };
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });

  const arg = process.argv[2] || process.env.SHOT_SCENE || '';
  let pngs;

  if (arg) {
    const candidate = path.resolve(outDir, arg.endsWith('.png') ? arg : `${arg}.png`);
    try {
      await fs.access(candidate);
      pngs = [candidate];
    } catch {
      throw new Error(`PNG not found: ${candidate}`);
    }
  } else {
    const entries = await fs.readdir(outDir);
    pngs = entries
      .filter((f) => f.endsWith('.png') && !f.startsWith('.'))
      .map((f) => path.resolve(outDir, f));
  }

  if (pngs.length === 0) {
    throw new Error(`No PNG files in ${outDir}`);
  }

  const results = [];
  for (const png of pngs) {
    results.push(await convertOne(png));
  }
  return results;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
