# lobe-cli docs shots

Reusable Vite + React studio for README terminal screenshots.

Stack: **`@lobehub/ui`** (ThemeScope · Grainient · design tokens) · **`@lobehub/fluent-emoji`** · real CLI ANSI · **`@zumer/snapdom`** (DOM→PNG) · Playwright (browser host / fallback) · sharp WebP.

Typography uses Lobe UI code font token `var(--lobe-font-family-code)`. Terminal line-height is **1.285**. Panel rails are real ANSI box-drawing glyphs (`.term-rail`), not a CSS spine.

## One-shot: ANSI → WebP

```bash
pnpm shot
pnpm shot -- fixtures/commit-type.ansi
node scripts/shot.mjs path/to/foo.ansi
# → out/<name>.png + out/<name>.webp (1920w)
```

Capture engine (default **snapdom** in the live Vite page):

```bash
SHOT_ENGINE=snapdom pnpm shot    # default: window.__shotsCapture → PNG
SHOT_ENGINE=playwright pnpm shot # element.screenshot fallback
```

SnapDOM runs at CSS 1× layout with `scale: 3` (matches browser preview metrics; avoids Playwright `deviceScaleFactor` / viewport-shrink rail skew). Playwright is only the headless host, and the fallback if SnapDOM throws (e.g. tainted Grainient canvas / CORS emoji).

## Dev preview

```bash
pnpm dev
# http://127.0.0.1:5179/?scene=commit-type
# http://127.0.0.1:5179/?src=/fixtures/commit-type.ansi
```

## WebP only

```bash
pnpm to-webp
pnpm to-webp -- commit-type
WEBP_WIDTH=1920 pnpm to-webp
```

## Setup

```bash
cd docs/shots
pnpm install
pnpm exec playwright install chromium
```

Do not wire images into README until explicitly asked.
