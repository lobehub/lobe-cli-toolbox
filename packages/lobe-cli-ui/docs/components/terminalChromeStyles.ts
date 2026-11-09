import { createStaticStyles, cssVar } from '@lobehub/ui';

/**
 * Flat transparent Ink preview shell for LiveInkTerminal / XtermPreview / TerminalPreview.
 * Docs-kit Demo already provides the outer frame — no nested card, tag, or caption.
 * Height comes from measured content (LiveInkTerminal); do NOT clip with overflow:hidden.
 * xterm lineHeight stays 1.285 (product requirement); cssVar.lineHeight is not that value.
 */
export const TERM_LINE_HEIGHT = 1.285;

export const styles = createStaticStyles(({ css }) => ({
  root: css`
    background: transparent;
    margin: 0;
    position: relative;
  `,
  body: css`
    background: transparent;
    font-family: ${cssVar.fontFamilyCode};
    /* Do not mask clipping — height must track content (see LiveInkTerminal fit). */
    overflow: visible;
    padding-block: ${cssVar.paddingXS};
    padding-inline: 0;

    .xterm,
    .xterm-viewport,
    .xterm-screen {
      background: transparent !important;
    }

    /* Let viewport grow with resized rows; avoid always-on scrollbar gutter when content fits. */
    .xterm-viewport {
      overflow-y: auto;
    }
  `,
  ansiPre: css`
    margin: 0;
    padding-block: ${cssVar.paddingXS};
    padding-inline: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: ${cssVar.fontFamilyCode};
    font-size: ${cssVar.fontSize};
    line-height: ${TERM_LINE_HEIGHT};
    color: ${cssVar.colorText};
    background: transparent;
  `,
}));

/** Parse theme token length to px number for xterm options. */
export function tokenToPx(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    const px = trimmed.match(/^([\d.]+)px$/i);
    if (px) return Number(px[1]);
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return fallback;
}

/** Non-visual mode description for aria-label / title (no visible badge). */
export function modeAriaLabel(mode: string): string {
  switch (mode) {
    case 'live': {
      return 'Live Ink terminal preview';
    }
    case 'replay': {
      return 'Replaying captured Ink ANSI frames';
    }
    case 'connecting': {
      return 'Connecting to local Ink live runner';
    }
    default: {
      return 'Static Ink ANSI preview';
    }
  }
}
