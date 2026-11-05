import type { Key } from 'ink';

import { printable } from './list';

export interface TextEditState {
  cursor: number;
  value: string;
}

const clamp = (state: TextEditState, cursor: number) =>
  Math.max(0, Math.min(state.value.length, cursor));

const wordStart = (value: string, cursor: number) => {
  let index = cursor;
  while (index > 0 && value[index - 1] === ' ') index--;
  while (index > 0 && value[index - 1] !== ' ') index--;
  return index;
};

/**
 * Applies one keypress to a single-line input. Returns `undefined` for keys it does not handle
 * (enter, esc, tab, arrows up/down…), so the caller can react to them.
 */
export const editText = (
  state: TextEditState,
  input: string,
  key: Key,
): TextEditState | undefined => {
  const { cursor, value } = state;

  if (key.leftArrow) return { ...state, cursor: clamp(state, cursor - 1) };
  if (key.rightArrow) return { ...state, cursor: clamp(state, cursor + 1) };
  if (key.home || (key.ctrl && input === 'a')) return { ...state, cursor: 0 };
  if (key.end || (key.ctrl && input === 'e')) return { ...state, cursor: value.length };
  if (key.backspace) {
    if (cursor === 0) return state;
    return { cursor: cursor - 1, value: value.slice(0, cursor - 1) + value.slice(cursor) };
  }
  if (key.delete) return { ...state, value: value.slice(0, cursor) + value.slice(cursor + 1) };
  if (key.ctrl && input === 'u') return { cursor: 0, value: value.slice(cursor) };
  if (key.ctrl && input === 'k') return { cursor, value: value.slice(0, cursor) };
  if (key.ctrl && input === 'w') {
    const start = wordStart(value, cursor);
    return { cursor: start, value: value.slice(0, start) + value.slice(cursor) };
  }
  if (key.ctrl || key.meta || key.escape || key.return || key.tab) return undefined;
  if (key.upArrow || key.downArrow || key.pageUp || key.pageDown) return undefined;

  const text = printable(input.replaceAll(/\r?\n/g, ' '));
  if (!text) return undefined;
  return {
    cursor: cursor + text.length,
    value: value.slice(0, cursor) + text + value.slice(cursor),
  };
};
