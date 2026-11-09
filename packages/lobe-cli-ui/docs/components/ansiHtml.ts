import Convert from 'ansi-to-html';

const CURSOR_MARK = '##BLOCK_CURSOR##';

/** Strip CSI cursor / erase / scroll — keep SGR color (…m). From docs/shots. */
export function stripAnsiCursorControls(ansi: string): string {
  const esc = String.fromCharCode(27);
  return ansi
    .replaceAll(new RegExp(`${esc}\\[[0-9;]*[A-HJKSTf]`, 'g'), '')
    .replaceAll(new RegExp(`${esc}\\[\\?[0-9;]*[hl]`, 'g'), '')
    .replaceAll(new RegExp(`${esc}\\[[su]`, 'g'), '');
}

/** Keep last Ink synchronized frame. */
export function extractLastAnsiFrame(raw: string): string {
  const esc = String.fromCharCode(27);
  const marker = `${esc}[?2026h`;
  const idx = raw.lastIndexOf(marker);
  let frame = idx >= 0 ? raw.slice(idx + marker.length) : raw;
  frame = frame.replace(new RegExp(`${esc}\\[\\?2026l[\\s\\S]*$`), '');
  frame = frame.replaceAll(new RegExp(`${esc}\\[\\?25[lh]`, 'g'), '');
  return stripAnsiCursorControls(frame);
}

/** Patch Ink SGR that ansi-to-html handles poorly. */
export function patchInkAnsi(ansi: string): string {
  const esc = String.fromCharCode(27);
  return ansi
    .replaceAll(
      new RegExp(`${esc}\\[7m[ ${String.fromCharCode(0xA0)}]${esc}\\[27m`, 'g'),
      CURSOR_MARK,
    )
    .replaceAll(new RegExp(`${esc}\\[7m\\s+${esc}\\[27m`, 'g'), CURSOR_MARK)
    .replaceAll(new RegExp(`${esc}\\[2m`, 'g'), `${esc}[38;2;160;160;168m`)
    .replaceAll(new RegExp(`${esc}\\[22m`, 'g'), `${esc}[39m${esc}[22m`);
}

export function ansiToHtml(raw: string, fg: string, bg: string): string {
  const converter = new Convert({
    bg,
    escapeXML: true,
    fg,
    newline: true,
    stream: false,
  });
  const frame = patchInkAnsi(extractLastAnsiFrame(raw));
  let html = converter.toHtml(frame);
  html = html
    .replaceAll(CURSOR_MARK, '<span class="term-cursor" aria-hidden="true"></span>')
    .replaceAll('\r\n', '\n')
    .replaceAll('\r', '\n');
  return html;
}
