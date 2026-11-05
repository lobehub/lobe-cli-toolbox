import { FluentEmoji } from '@lobehub/fluent-emoji';
import Convert from 'ansi-to-html';
import emojiRegex from 'emoji-regex';
import { createElement, Fragment, type ReactNode, useMemo } from 'react';

const FG = '#eef0f5';
const DIM = '#a0a0a8';
/** ASCII placeholder — ansi-to-html escapeXML keeps it (unlike U+E000 → &#xE000;). */
const CURSOR_MARK = '##BLOCK_CURSOR##';

/** Match one terminal cell; emoji occupy ~2 cells in Ink. */
const EMOJI_SIZE = 15;

const converter = new Convert({
  fg: FG,
  bg: '#08080a',
  newline: true,
  escapeXML: true,
  stream: false,
});

/**
 * Strip CSI cursor / erase / scroll controls that ansi-to-html does not understand.
 * Without this, finals like `A` from `CSI 1 A` (cursor up) and `G` from `CSI G`
 * leak into the HTML as literal text — e.g. five ups + CHA → visible "AAAAAG"
 * before the panel rail `┌`. SGR (`…m`) and other sequences are left intact.
 */
export function stripAnsiCursorControls(ansi: string): string {
  // Build patterns via RegExp (not /\x1b/ literals) to satisfy no-control-regex.
  const esc = String.fromCharCode(27);
  return ansi
    // CUU/CUD/CUF/CUB, CNL/CPL, CHA, CUP/HVP, ED/EL, SU/SD
    // eslint-disable-next-line regexp/prefer-range -- CSI finals A-H/J/K/S/T/f (not a contiguous alphabet run)
    .replaceAll(new RegExp(`${esc}\\[[0-9;]*[ABCDEFGJKSTHf]`, 'g'), '')
    // private-mode set/reset leftovers (cursor visibility etc. already partly stripped)
    .replaceAll(new RegExp(`${esc}\\[\\?[0-9;]*[hl]`, 'g'), '')
    // SCOSC / SCORC
    .replaceAll(new RegExp(`${esc}\\[[su]`, 'g'), '');
}

/** Keep the last Ink synchronized frame when the capture contains multiple redraws. */
export function extractLastAnsiFrame(raw: string): string {
  const esc = String.fromCharCode(27);
  const marker = `${esc}[?2026h`;
  const idx = raw.lastIndexOf(marker);
  let frame = idx >= 0 ? raw.slice(idx + marker.length) : raw;
  frame = frame.replace(new RegExp(`${esc}\\[\\?2026l[\\s\\S]*$`), '');
  frame = frame.replaceAll(new RegExp(`${esc}\\[\\?25[lh]`, 'g'), '');
  return stripAnsiCursorControls(frame);
}

/**
 * Patch Ink SGR that ansi-to-html handles poorly:
 * - dim (2) → fixed gray truecolor
 * - inverse space (7) → cursor marker
 */
export function patchInkAnsi(ansi: string): string {
  const esc = String.fromCharCode(27);
  return ansi
    .replaceAll(new RegExp(`${esc}\\[7m[ ${String.fromCharCode(0xA0)}]${esc}\\[27m`, 'g'), CURSOR_MARK)
    .replaceAll(new RegExp(`${esc}\\[7m\\s+${esc}\\[27m`, 'g'), CURSOR_MARK)
    .replaceAll(new RegExp(`${esc}\\[2m`, 'g'), `${esc}[38;2;160;160;168m`)
    .replaceAll(new RegExp(`${esc}\\[22m`, 'g'), `${esc}[39m${esc}[22m`);
}

export function ansiToHtml(raw: string): string {
  const frame = patchInkAnsi(extractLastAnsiFrame(raw));
  let html = converter.toHtml(frame);
  html = html
    .replaceAll(CURSOR_MARK, '<span class="term-cursor" aria-hidden="true"></span>')
    .replaceAll('&lt;&lt;BLOCK_CURSOR&gt;&gt;', '<span class="term-cursor" aria-hidden="true"></span>')
    .replaceAll(/&#xE000;/gi, '<span class="term-cursor" aria-hidden="true"></span>')
    .replaceAll('&#57344;', '<span class="term-cursor" aria-hidden="true"></span>');
  html = html.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
  return html;
}

function splitEmojiText(text: string, keyPrefix: string): ReactNode[] {
  const re = emojiRegex();
  const nodes: ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    const emoji = match[0];
    nodes.push(
      createElement(FluentEmoji, {
        key: `${keyPrefix}-e-${i++}`,
        emoji,
        type: '3d',
        size: EMOJI_SIZE,
        className: 'term-fluent-emoji',
        style: {
          display: 'inline-block',
          width: '2ch',
          height: EMOJI_SIZE,
          verticalAlign: 'middle',
          margin: 0,
          padding: 0,
          objectFit: 'contain',
        },
      }),
    );
    last = match.index + emoji.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Box-drawing / panel glyphs rendered as real ANSI cells (fixed 1ch), no CSS spine. */
const RAIL_CHARS = new Set(['┌', '┐', '└', '┘', '│', '─', '├', '┤', '┬', '┴', '┼', '◆', '◇', '♦']);

function splitRailAndEmoji(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let buf = '';
  let i = 0;
  const flush = () => {
    if (!buf) return;
    nodes.push(...splitEmojiText(buf, `${keyPrefix}-e${i++}`));
    buf = '';
  };
  for (const ch of text) {
    if (RAIL_CHARS.has(ch)) {
      flush();
      nodes.push(
        createElement(
          'span',
          {
            key: `${keyPrefix}-r${i++}`,
            className: ch === '│' ? 'term-rail term-rail-v' : 'term-rail term-rail-node',
            'aria-hidden': true,
            'data-ch': ch,
          },
          ch,
        ),
      );
    } else {
      buf += ch;
    }
  }
  flush();
  return nodes;
}

function decodeEntities(text: string): string {
  return text
    .replaceAll('&nbsp;', '\u00A0')
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"')
    .replaceAll(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replaceAll(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number.parseInt(d, 10)));
}

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'open'; tag: string; attrs: Record<string, string> }
  | { kind: 'close'; tag: string }
  | { kind: 'self'; tag: string; attrs: Record<string, string> };

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re = /([^\s=]+)(?:="([^"]*)")?/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(raw)) !== null) {
    attrs[m[1]] = m[2] ?? '';
  }
  return attrs;
}

function tokenizeHtml(html: string): Token[] {
  const tokens: Token[] = [];
  const re = /<\/?([a-z]\w*)\b([^>]*)>|([^<]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m[3] != null) {
      tokens.push({ kind: 'text', value: decodeEntities(m[3]) });
      continue;
    }
    const tag = m[1].toLowerCase();
    const full = m[0];
    const attrRaw = m[2] ?? '';
    if (full.startsWith('</')) {
      tokens.push({ kind: 'close', tag });
    } else if (full.endsWith('/>') || tag === 'br') {
      tokens.push({ kind: 'self', tag, attrs: parseAttrs(attrRaw) });
    } else {
      tokens.push({ kind: 'open', tag, attrs: parseAttrs(attrRaw) });
    }
  }
  return tokens;
}

function styleFromAttr(style?: string): React.CSSProperties | undefined {
  if (!style) return undefined;
  const out: Record<string, string> = {};
  for (const part of style.split(';')) {
    const [k, ...rest] = part.split(':');
    if (!k || rest.length === 0) continue;
    const key = k.trim().replaceAll(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key] = rest.join(':').trim();
  }
  return out as React.CSSProperties;
}

function htmlToReact(html: string): ReactNode {
  const tokens = tokenizeHtml(html);
  let i = 0;

  function readNodes(stopTag?: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    while (i < tokens.length) {
      const t = tokens[i++]!;
      if (t.kind === 'close') {
        if (stopTag && t.tag === stopTag) return nodes;
        continue;
      }
      if (t.kind === 'text') {
        nodes.push(...splitRailAndEmoji(t.value, `t${i}`));
        continue;
      }
      if (t.kind === 'self') {
        if (t.tag === 'br') nodes.push(createElement('br', { key: `br-${i}` }));
        else if (t.tag === 'span' && (t.attrs.class || '').includes('term-cursor')) {
          nodes.push(
            createElement('span', {
              key: `cur-${i}`,
              className: 'term-cursor',
              'aria-hidden': true,
            }),
          );
        }
        continue;
      }
      const children = readNodes(t.tag);
      if (t.tag === 'span') {
        const cls = t.attrs.class || '';
        if (cls.includes('term-cursor')) {
          nodes.push(
            createElement('span', {
              key: `cur-${i}`,
              className: 'term-cursor',
              'aria-hidden': true,
            }),
          );
        } else {
          nodes.push(
            createElement(
              'span',
              { key: `s-${i}`, style: styleFromAttr(t.attrs.style), className: cls || undefined },
              ...children,
            ),
          );
        }
      } else if (t.tag === 'b' || t.tag === 'strong') {
        nodes.push(createElement('b', { key: `b-${i}` }, ...children));
      } else if (t.tag === 'i' || t.tag === 'em') {
        nodes.push(createElement('i', { key: `i-${i}` }, ...children));
      } else if (t.tag === 'u') {
        nodes.push(createElement('u', { key: `u-${i}` }, ...children));
      } else {
        nodes.push(createElement(Fragment, { key: `f-${i}` }, ...children));
      }
    }
    return nodes;
  }

  return createElement(Fragment, null, ...readNodes());
}

export function AnsiTerminal({ ansi }: { ansi: string }) {
  const nodes = useMemo(() => htmlToReact(ansiToHtml(ansi)), [ansi]);
  return <div className="terminal-ansi">{nodes}</div>;
}

export { DIM, FG };
