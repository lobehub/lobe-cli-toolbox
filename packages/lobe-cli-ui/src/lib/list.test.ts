import { describe, expect, it } from 'vitest';

import { filterItems, getWindowStart, moveIndex, printable } from './list';

describe('getWindowStart', () => {
  it('shows everything when the list fits', () => {
    expect(getWindowStart(5, 4, 10)).toBe(0);
  });

  it('keeps the cursor centered and clamps at both ends', () => {
    expect(getWindowStart(20, 0, 5)).toBe(0);
    expect(getWindowStart(20, 10, 5)).toBe(8);
    expect(getWindowStart(20, 19, 5)).toBe(15);
  });
});

describe('moveIndex', () => {
  it('wraps single steps', () => {
    expect(moveIndex(3, 0, -1)).toBe(2);
    expect(moveIndex(3, 2, 1)).toBe(0);
  });

  it('clamps page jumps', () => {
    expect(moveIndex(10, 2, -5)).toBe(0);
    expect(moveIndex(10, 8, 5)).toBe(9);
  });

  it('handles empty lists', () => {
    expect(moveIndex(0, 0, 1)).toBe(0);
  });
});

describe('filterItems', () => {
  const items = [
    { hint: 'Fix a bug', label: 'fix', value: 'fix' },
    { hint: 'Introduce new features', label: 'feat', value: 'feat' },
    { hint: 'Refactor code', keywords: ['recycle'], label: 'refactor', value: 'refactor' },
  ];

  it('returns all items for an empty query', () => {
    expect(filterItems(items, '  ')).toBe(items);
  });

  it('ranks prefix matches before substring matches', () => {
    expect(filterItems(items, 'f').map((item) => item.value)).toEqual(['fix', 'feat', 'refactor']);
    expect(filterItems(items, 'fe').map((item) => item.value)).toEqual(['feat']);
  });

  it('matches hints and keywords case-insensitively', () => {
    expect(filterItems(items, 'BUG').map((item) => item.value)).toEqual(['fix']);
    expect(filterItems(items, 'recy').map((item) => item.value)).toEqual(['refactor']);
  });
});

describe('printable', () => {
  it('drops control characters', () => {
    expect(printable('a\rb\u001Bc\u007F')).toBe('abc');
  });
});
