/**
 * Pure helpers for Ink→xterm replay without blank-frame flicker.
 * Frames from capture-ink-frames-demo are cumulative stdout snapshots.
 */

/** Strip only private modes that break xterm previews (alt screen / bracketed paste). Keep ?25 cursor and ?2026 sync markers. */
export function sanitizeAnsi(ansi: string): string {
  const esc = String.fromCharCode(27);
  return ansi
    .replaceAll(new RegExp(esc + '\\[\\?1049[hl]', 'g'), '')
    .replaceAll(new RegExp(esc + '\\[\\?47[hl]', 'g'), '')
    .replaceAll(new RegExp(esc + '\\[\\?2004[hl]', 'g'), '');
}

/**
 * Drop trailing newlines even when followed by cursor/mode CSI tails.
 * A dangling newline after the last content row advances the cursor onto an empty
 * row; content-sized terminals then scroll and clip a corner/title line.
 */
export function rtrimTrailingNewlines(raw: string): string {
  const esc = String.fromCharCode(27);
  let body = raw;
  let tail = '';
  // Peel trailing CSI sequences, trim newlines on the body, rejoin.
  /* eslint-disable regexp/no-obscure-range -- CSI final byte ranges */
  const csiAtEnd = new RegExp(esc + '\\[[0-9;?]*[ -/]*[@-~]$');
  /* eslint-enable regexp/no-obscure-range */
  while (body.length) {
    const m = body.match(csiAtEnd);
    if (!m) break;
    tail = m[0] + tail;
    body = body.slice(0, -m[0].length);
  }
  body = body.replace(/(?:\r?\n)+$/u, '');
  return body + tail;
}

export function prepareAnsi(raw: string): string {
  return sanitizeAnsi(raw).replaceAll(/\r?\n/g, '\r\n');
}

/** Full clear + home in the SAME write payload (never call term.reset() on a prior tick). */
export const CLEAR_HOME = '\u001B[2J\u001B[3J\u001B[H';

export type TermOp = { op: 'write'; data: string } | { op: 'reset' }; // only for tests detecting forbidden patterns

/**
 * Plan writes for cumulative frame replay.
 * - Between frames: write only the suffix delta (no clear).
 * - On loop restart or non-prefix frame: one atomic CLEAR_HOME + full frame write.
 */
export function planReplayWrite(
  previousPrepared: string,
  nextRaw: string,
  opts?: { forceRestart?: boolean },
): { prepared: string; ops: TermOp[] } {
  const prepared = prepareAnsi(nextRaw);
  if (opts?.forceRestart || !previousPrepared || !prepared.startsWith(previousPrepared)) {
    return { prepared, ops: [{ op: 'write', data: CLEAR_HOME + prepared }] };
  }
  const delta = prepared.slice(previousPrepared.length);
  if (!delta) return { prepared, ops: [] };
  return { prepared, ops: [{ op: 'write', data: delta }] };
}

/** Coalesce live chunks so a sync region (?2026h … ?2026l) is one write when possible. */
export function pushLiveChunk(
  pending: string,
  chunk: string,
): { pending: string; flush: string | null } {
  const next = pending + chunk;
  const esc = String.fromCharCode(27);
  const end = next.lastIndexOf(esc + '[?2026l');
  if (end >= 0) {
    const cut = end + (esc + '[?2026l').length;
    return { pending: next.slice(cut), flush: next.slice(0, cut) };
  }
  // No complete sync region yet — hold (caller should also time-flush).
  return { pending: next, flush: null };
}
