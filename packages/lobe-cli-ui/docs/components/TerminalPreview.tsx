import { useTheme } from '@lobehub/ui';
import { useMemo } from 'react';

import { ansiToHtml } from './ansiHtml';
import { modeAriaLabel, styles } from './terminalChromeStyles';

export interface TerminalPreviewProps {
  /** Raw ANSI from a real Ink render (must include color CSI when themed). */
  ansi: string;
  /** @deprecated Captions removed; ignored. */
  caption?: string;
  /** Kept for call-site compat; no longer rendered as chrome title. */
  title?: string;
}

/**
 * HTML ANSI chrome (legacy). Prefer XtermPreview / LiveInkTerminal.
 * Transparent Demo surface; Static aria only — no nested card / Tag.
 */
export default function TerminalPreview({ ansi }: TerminalPreviewProps) {
  const theme = useTheme();
  const fg = theme.colorText;
  // Transparent page blend; ansi-to-html still paints SGR backgrounds from the stream.
  const bg = 'transparent';
  const html = useMemo(() => ansiToHtml(ansi, fg, bg), [ansi, fg, bg]);
  const label = modeAriaLabel('static');

  return (
    <div aria-label={label} className={styles.root} title={label}>
      <pre
        className={`ink-ansi-preview ${styles.ansiPre}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
