import { describe, expect, it } from 'vitest';

import { arrayRotate } from './arrayRotate';

describe('arrayRotate', () => {
  it.each([
    [0, [1, 2, 3, 4]],
    [1, [4, 1, 2, 3]],
    [-1, [2, 3, 4, 1]],
    [5, [4, 1, 2, 3]],
    [-6, [3, 4, 1, 2]],
  ])('rotates by %i', (count, expected) => {
    expect(arrayRotate([1, 2, 3, 4], count)).toEqual(expected);
  });

  it('handles empty arrays and does not mutate the input', () => {
    const input = [1, 2];
    expect(arrayRotate([], 3)).toEqual([]);
    arrayRotate(input, 1);
    expect(input).toEqual([1, 2]);
  });
});
