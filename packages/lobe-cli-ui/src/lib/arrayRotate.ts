/** Rotates `items` right by `count` (left when negative), returning a new array. */
export const arrayRotate = <T>(items: readonly T[], count: number): T[] => {
  const { length } = items;
  if (length === 0) return [];
  const shift = ((count % length) + length) % length;
  return [...items.slice(length - shift), ...items.slice(0, length - shift)];
};
