import type { IBufferCell, Terminal } from '@xterm/xterm';

import { CLEAR_HOME, planReplayWrite, prepareAnsi } from './ansiReplay.mjs';

/** A painted frame, NOT an Ink stdout prefix. No trailing newline/cursor movement. */
export interface ScreenSnapshot {
  ansi: string;
  cols: number;
  rows: number;
  text: string[];
}

function cellSgr(cell: IBufferCell): string {
  const codes: number[] = [0];
  if (cell.isBold()) codes.push(1);
  if (cell.isDim()) codes.push(2);
  if (cell.isItalic()) codes.push(3);
  if (cell.isUnderline()) codes.push(4);
  if (cell.isBlink()) codes.push(5);
  if (cell.isInverse()) codes.push(7);
  if (cell.isInvisible()) codes.push(8);
  if (cell.isStrikethrough()) codes.push(9);
  if (cell.isOverline()) codes.push(53);
  for (const foreground of [true, false]) {
    const color = foreground ? cell.getFgColor() : cell.getBgColor();
    const rgb = foreground ? cell.isFgRGB() : cell.isBgRGB();
    const palette = foreground ? cell.isFgPalette() : cell.isBgPalette();
    const base = foreground ? 38 : 48;
    if (rgb) codes.push(base, 2, (color >>> 16) & 255, (color >>> 8) & 255, color & 255);
    else if (palette) codes.push(base, 5, color);
  }
  return `\u001B[${codes.join(';')}m`;
}

/** Public xterm buffer API only; preserves wide/combined glyphs and SGR styling. */
export function readScreen(term: Terminal): ScreenSnapshot {
  const buffer = term.buffer.active;
  const rows: string[] = [];
  const text: string[] = [];
  let usedRows = 0;
  let usedCols = 0;
  for (let y = 0; y < buffer.length; y++) {
    const line = buffer.getLine(y);
    if (!line) continue;
    let last = 0;
    for (let x = 0; x < term.cols; x++) {
      const cell = line.getCell(x);
      if (!cell) continue;
      // Background/inverse spaces are painted cells too (e.g. selected inputs).
      if (cell.getChars().trim() || !cell.isBgDefault() || cell.isInverse()) {
        last = Math.max(last, x + Math.max(1, cell.getWidth()));
      }
    }
    let ansi = '';
    let previousSgr = '';
    for (let x = 0; x < last; x++) {
      const cell = line.getCell(x);
      if (!cell || cell.getWidth() === 0) continue;
      const sgr = cellSgr(cell);
      if (sgr !== previousSgr) ansi += sgr;
      previousSgr = sgr;
      ansi += cell.getChars() || ' ';
    }
    rows.push(ansi + '\u001B[0m');
    text.push(line.translateToString(true));
    if (last > 0) usedRows = y + 1;
    usedCols = Math.max(usedCols, last);
  }
  // Keep interior blank rows. Remove only unpainted trailing protocol workspace.
  return {
    ansi: rows.slice(0, Math.max(1, usedRows)).join('\r\n') + '\u001B[?25l',
    cols: Math.max(2, usedCols),
    rows: Math.max(1, usedRows),
    text: text.slice(0, usedRows),
  };
}

export function writeAndWait(term: Terminal, data: string): Promise<void> {
  return new Promise((resolve) => term.write(data, resolve));
}

/**
 * Keep Ink's protocol buffer independent of the displayed grid. Shrinking the
 * protocol terminal to its painted rows scrolls away its trailing cursor row,
 * so the next CUU/erase corrupts even a one-line spinner. The model is never
 * opened into a DOM; only complete screen snapshots enter the visible terminal.
 * All writes (including resize/repaint) are serialized and awaited.
 */
export function createTerminalPlayback(
  model: Terminal,
  view: Terminal,
  onScreen?: (screen: ScreenSnapshot) => void,
) {
  let previous = '';
  let disposed = false;
  let queue = Promise.resolve();
  const enqueue = (write: () => Promise<void>) => {
    queue = queue.then(async () => {
      if (disposed) return;
      await write();
      if (disposed) return;
      const screen = readScreen(model);
      if (view.cols !== screen.cols || view.rows !== screen.rows) {
        view.resize(screen.cols, screen.rows);
      }
      await writeAndWait(view, CLEAR_HOME + '\u001B[0m' + screen.ansi);
      if (!disposed) onScreen?.(screen);
    });
    return queue;
  };
  return {
    dispose: () => {
      disposed = true;
    },
    live: (chunk: string) => enqueue(() => writeAndWait(model, prepareAnsi(chunk))),
    replay: (raw: string, forceRestart = false) =>
      enqueue(async () => {
        const { prepared, ops } = planReplayWrite(previous, raw, { forceRestart });
        previous = prepared;
        for (const op of ops) {
          if (op.op === 'write') await writeAndWait(model, op.data);
        }
      }),
  };
}
