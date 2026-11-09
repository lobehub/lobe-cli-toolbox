import '@xterm/xterm/css/xterm.css';

import { useTheme } from '@lobehub/ui';
import { Terminal } from '@xterm/xterm';
import { useEffect, useRef, useState } from 'react';

import { modeAriaLabel, styles, TERM_LINE_HEIGHT, tokenToPx } from './terminalChromeStyles';
import { createTerminalPlayback } from './terminalPlayback';
import { applyInkAlignedUnicode, terminalFontFamily } from './xtermUnicode';

export interface AnsiFrame {
  ansi: string;
  t: number;
}

export interface LiveInkTerminalProps {
  ansi?: string;
  /** Protocol columns: must match the capture/live TTY, not the card width. */
  cols?: number;
  demoId: string;
  frames?: AnsiFrame[];
  interactive?: boolean;
  /** Protocol workspace only. Never used as a DOM height. */
  rows?: number;
  title?: string;
}

type PreviewMode = 'connecting' | 'live' | 'replay' | 'static';
const EMPTY_FRAMES: AnsiFrame[] = [];

function b64ToUtf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

/**
 * Model: unopened xterm with Ink's stable protocol grid and cursor workspace.
 * View: only painted screen cells, with its own correctly sized terminal grid.
 * xterm's .xterm-screen contributes its actual measured height to normal flow;
 * there is no fontSize*rows guess, fixed shell height, or hidden glyph clipping.
 */
export default function LiveInkTerminal({
  demoId,
  frames = EMPTY_FRAMES,
  ansi = '',
  interactive = false,
  cols = 80,
  rows = 24,
}: LiveInkTerminalProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const theme = useTheme();
  const fontFamily = theme.fontFamilyCode;
  const fontSize = tokenToPx(theme.fontSize as string | number, 14);
  const fg = theme.colorText;
  const [mode, setMode] = useState<PreviewMode>('connecting');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const model = new Terminal({
      allowProposedApi: true,
      cols,
      convertEol: true,
      // Matches capture's 24-row TTY, with metadata allowing larger examples.
      // This buffer is never opened or attached to the page.
      rows: Math.max(24, rows),
      scrollback: 1000,
    });
    applyInkAlignedUnicode(model);
    const term = new Terminal({
      allowProposedApi: true,
      allowTransparency: true,
      cols: 2,
      rows: 1,
      convertEol: true,
      cursorBlink: false,
      disableStdin: !interactive,
      fontFamily: terminalFontFamily(fontFamily),
      fontSize,
      lineHeight: TERM_LINE_HEIGHT,
      scrollback: 0,
      theme: { background: 'transparent', foreground: fg, cursor: fg },
    });
    applyInkAlignedUnicode(term);
    term.open(host);
    termRef.current = term;
    const playback = createTerminalPlayback(model, term, (screen) => {
      host.dataset['inkRows'] = String(screen.rows);
      host.dataset['inkCols'] = String(screen.cols);
    });
    let disposed = false;
    let replayStarted = false;
    let liveOk = false;
    let ws: WebSocket | null = null;
    let replayTimer: ReturnType<typeof setTimeout> | undefined;
    let fallback: ReturnType<typeof setTimeout> | undefined;
    let detachKey: (() => void) | undefined;
    let liveBuf = '';
    let liveRaf = 0;
    setMode('connecting');

    const showError = (error: unknown) => {
      if (disposed) return;
      host.dataset['inkError'] = String(error);
      console.error('Ink preview failed', demoId, error);
    };
    const startReplay = () => {
      if (disposed || replayStarted || liveOk) return;
      replayStarted = true;
      setMode(frames.length >= 2 ? 'replay' : 'static');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let i = reducedMotion ? Math.max(0, frames.length - 1) : 0;
      const tick = async () => {
        if (disposed) return;
        const frame = frames[i];
        try {
          await playback.replay(frame?.ansi || ansi, i === 0);
        } catch (error) {
          showError(error);
          return;
        }
        if (disposed || reducedMotion || frames.length < 2) return;
        const nextIndex = (i + 1) % frames.length;
        const next = frames[nextIndex]!;
        const delay = nextIndex === 0 ? 800 : Math.max(40, next.t - frame!.t);
        i = nextIndex;
        replayTimer = setTimeout(() => {
          void tick();
        }, delay);
      };
      void tick();
    };
    const flushLiveBuf = () => {
      liveRaf = 0;
      if (disposed || !liveBuf) return;
      const out = liveBuf;
      liveBuf = '';
      void playback.live(out).catch(showError);
    };
    const canLive =
      interactive &&
      (location.hostname === 'localhost' || location.hostname === '127.0.0.1') &&
      (Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV) || location.port === '5173');
    if (!canLive) startReplay();
    else {
      const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
      try {
        ws = new WebSocket(
          `${protocol}://${location.host}/__ink-live?demo=${encodeURIComponent(demoId)}&cols=${cols}&rows=${Math.max(rows, 24)}`,
        );
        fallback = setTimeout(() => {
          if (disposed || liveOk) return;
          ws?.close();
          startReplay();
        }, 2500);
        ws.onmessage = (event) => {
          if (disposed || replayStarted) return;
          try {
            const msg = JSON.parse(String(event.data));
            if (msg.type === 'ready') {
              liveOk = true;
              setMode('live');
              clearTimeout(fallback);
              term.options.disableStdin = false;
              const listener = term.onData((data) =>
                ws?.send(JSON.stringify({ type: 'key', data })),
              );
              detachKey = () => listener.dispose();
            } else if (msg.type === 'ansi' && typeof msg.data === 'string') {
              liveBuf += b64ToUtf8(msg.data);
              if (!liveRaf) liveRaf = requestAnimationFrame(flushLiveBuf);
            } else if (msg.type === 'error') {
              void playback.live(`\r\n\u001B[31m${String(msg.message)}\u001B[0m`).catch(showError);
            }
          } catch {
            /* Ignore non-protocol messages. */
          }
        };
        ws.onerror = () => {
          clearTimeout(fallback);
          if (!liveOk) startReplay();
        };
        ws.onclose = () => {
          clearTimeout(fallback);
          if (!liveOk && !disposed) startReplay();
          term.options.disableStdin = true;
        };
      } catch {
        startReplay();
      }
    }
    return () => {
      disposed = true;
      playback.dispose();
      clearTimeout(replayTimer);
      clearTimeout(fallback);
      if (liveRaf) cancelAnimationFrame(liveRaf);
      detachKey?.();
      try {
        if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'exit' }));
        ws?.close();
      } catch {
        /* Already closed. */
      }
      model.dispose();
      term.dispose();
      termRef.current = null;
    };
    // Theme is refreshed below without resetting protocol/animation state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoId, cols, rows, interactive, ansi, frames]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.fontFamily = terminalFontFamily(fontFamily);
    term.options.fontSize = fontSize;
    term.options.lineHeight = TERM_LINE_HEIGHT;
    term.options.theme = { background: 'transparent', foreground: fg, cursor: fg };
    term.refresh(0, term.rows - 1);
  }, [fontFamily, fontSize, fg]);

  const label = modeAriaLabel(mode);
  return (
    <div aria-label={label} className={styles.root} title={label}>
      <div
        className={`ink-xterm-preview ${styles.body}`}
        data-ink-demo={demoId}
        data-ink-live={mode}
        ref={hostRef}
        tabIndex={0}
      />
    </div>
  );
}
