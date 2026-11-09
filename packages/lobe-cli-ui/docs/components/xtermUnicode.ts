import { UnicodeGraphemesAddon } from '@xterm/addon-unicode-graphemes';
import type { Terminal } from '@xterm/xterm';

/**
 * Align xterm column widths with Ink 8 (string-width@8 / grapheme + RGI emoji).
 *
 * Evidence (@xterm/xterm@5.5.0 headless cursorX vs ink's string-width):
 * - default Unicode 6: emoji like ✨/🐛 are width 1 → SelectInput rows off-by-one
 * - @xterm/addon-unicode11 ("11"): fixes BMP emoji; still wrong for VS16 (♻️/🖋️) and ZWJ
 * - @xterm/addon-unicode-graphemes activeVersion "15-graphemes": 0 mismatches on demo set
 *
 * Addon is marked experimental by xterm; it is the only published provider that matches Ink
 * grapheme/RGI rules for VS16 + ZWJ. Activate "15-graphemes" (not plain "15").
 */
export const XTERM_UNICODE_VERSION = '15-graphemes' as const;

export function applyInkAlignedUnicode(term: Terminal): UnicodeGraphemesAddon {
  const addon = new UnicodeGraphemesAddon();
  term.loadAddon(addon);
  term.unicode.activeVersion = XTERM_UNICODE_VERSION;
  return addon;
}

/** Code font + symbol then color-emoji fallbacks (glyph paint only; column width is unicode provider). */
export function terminalFontFamily(fontFamilyCode: string): string {
  const base =
    fontFamilyCode?.trim() || 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
  // Segoe UI Symbol / Apple Symbols first so ▲✓● stay text glyphs; color emoji fonts last for message emoji.
  return `${base}, "Segoe UI Symbol", "Apple Symbols", "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", emoji, sans-serif`;
}
