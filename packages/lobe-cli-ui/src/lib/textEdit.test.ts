import type { Key } from 'ink';
import { describe, expect, it } from 'vitest';

import { editText } from './textEdit';

const key = (patch: Partial<Key> = {}) => ({ ...patch }) as Key;
const at = (value: string, cursor = value.length) => ({ cursor, value });

describe('editText', () => {
  it('inserts at the cursor', () => {
    expect(editText(at('ac', 1), 'b', key())).toEqual(at('abc', 2));
  });

  it('inserts pasted text on one line without control characters', () => {
    expect(editText(at(''), 'a\r\nb\u0007', key())).toEqual(at('a b'));
  });

  it('deletes backward and forward', () => {
    expect(editText(at('abc', 2), '', key({ backspace: true }))).toEqual(at('ac', 1));
    expect(editText(at('abc', 0), '', key({ backspace: true }))).toEqual(at('abc', 0));
    expect(editText(at('abc', 1), '', key({ delete: true }))).toEqual(at('ac', 1));
  });

  it('moves the cursor', () => {
    expect(editText(at('abc'), '', key({ leftArrow: true }))).toEqual(at('abc', 2));
    expect(editText(at('abc', 3), '', key({ rightArrow: true }))).toEqual(at('abc', 3));
    expect(editText(at('abc'), 'a', key({ ctrl: true }))).toEqual(at('abc', 0));
    expect(editText(at('abc', 0), '', key({ end: true }))).toEqual(at('abc', 3));
  });

  it('supports readline kill shortcuts', () => {
    expect(editText(at('foo bar', 4), 'u', key({ ctrl: true }))).toEqual(at('bar', 0));
    expect(editText(at('foo bar', 4), 'k', key({ ctrl: true }))).toEqual(at('foo ', 4));
    expect(editText(at('foo bar  '), 'w', key({ ctrl: true }))).toEqual(at('foo ', 4));
  });

  it('leaves submit and navigation keys to the caller', () => {
    expect(editText(at('a'), '', key({ return: true }))).toBeUndefined();
    expect(editText(at('a'), '', key({ escape: true }))).toBeUndefined();
    expect(editText(at('a'), '', key({ upArrow: true }))).toBeUndefined();
    expect(editText(at('a'), 'x', key({ ctrl: true }))).toBeUndefined();
  });
});
