# `@lobehub/docs-kit` for cli-ui docs

Consumer Vite extension uses the **published** API:

- dependency: `@lobehub/docs-kit@^6.4.0`
- entry: `@lobehub/docs-kit/vite-extension` (`defineDocsVite`)
- module: `docs.vite.ts` (also referenced from `docs.config.ts` → `vite: './docs.vite.ts'`)

No pnpm patch and no `link:` path. npm `6.3.1` did not include this API; `6.4.0+` does.

## Terminal flicker (xterm write sequencing)

Captured animated frames are **cumulative** Ink stdout. Replaying with `Terminal#reset()` then `write()` on the next turn blanks the viewport (visible flash). Fix: `docs/components/ansiReplay.ts` plans **delta writes**; loop wrap uses one `CLEAR_HOME + frame` write. Live WS chunks are rAF-coalesced; the worker also coalesces to `?2026l` regions. `@xterm/xterm@5.5` does **not** implement DEC mode 2026 — do not rely on it for atomicity. Regression: `scripts/verify-ink-terminal-flicker.mjs`.

## xterm Unicode / emoji column width

Ink 8 lays out with `string-width@8` (grapheme + RGI emoji = 2). `@xterm/xterm@5.5` defaults to Unicode **6** (emoji often width 1) → SelectInput rows look shifted.

Docs terminals load `@xterm/addon-unicode-graphemes` and set `unicode.activeVersion = '15-graphemes'` (see `docs/components/xtermUnicode.ts`). Measured 0 mismatches vs Ink on ✨/🐛/♻️/ZWJ/CJK demo strings. Addon is experimental upstream; plain `"15"` or `unicode11` alone still mis-measure VS16/ZWJ clusters.
