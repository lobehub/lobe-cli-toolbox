# Ink live runner (local docs only)

Internal maintainer notes for `@lobehub/cli-ui` docs demos. Do **not** paste these implementation details into public component MDX.

## Modes

### Live (docs:dev only)

- Vite middleware attaches `/__ink-live?demo=<id>` on the existing docs server.
- Whitelist: `scripts/ink-demo-registry.mjs` IDs only.
- Loopback Origin/Host only; worker `ink-live-worker.mjs` + fake TTY (`ink-tty.mjs`).
- Production build does **not** require the live runner.

### Static fallback

- Transform embeds timestamped `{t,ansi}` frames into `LiveInkTerminal`.
- ANSI via `FORCE_COLOR=3`; xterm.js preview with `@xterm/addon-unicode-graphemes` (`15-graphemes`).

### Height

- Preview host height tracks fitted buffer rows (live resize), not a one-shot capture lock + `overflow: hidden` mask.

### StyleX

- Consumer purge of generated `react-router.config.mjs` before docs:dev (unpublished docs-kit Router path fix). No node_modules patches.
