/**
 * How to (re)capture real CLI ANSI for fixtures.
 *
 * Prefer the Node script: `pnpm capture` / `node scripts/capture-ansi.mjs`.
 * It opens a PTY, runs real CLIs in demo dirs, and writes fixtures/<name>.ansi.
 *
 * Scenes (default = all):
 *   commit-type | preview   lobe-commit Commit type screen
 *   preview-ai              AI commit message (needs API key)
 *   preview-editor          type → scope → subject → Link issues
 *   lobe-i18n-preview       real translate run (best dual-locale frame)
 *   preview-label           lobe-label -o Settings
 *
 * Manual sketch:
 *   - Prepare a demo cwd (git staged change / incomplete locales)
 *   - PATH must include the nvm node that has the CLIs
 *   - TERM=xterm-256color COLORTERM=truecolor FORCE_COLOR=3
 *   - Winsize ~ 28–36 rows × 72–90 cols
 *   - Persist raw bytes (keep CSI / synchronized updates)
 */
export const CAPTURE_HINT = 'pnpm capture';
