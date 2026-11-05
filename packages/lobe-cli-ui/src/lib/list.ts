/** First visible index of a `limit`-sized window that keeps `index` roughly centered. */
export const getWindowStart = (count: number, index: number, limit: number): number => {
  if (count <= limit) return 0;
  return Math.max(0, Math.min(index - Math.floor(limit / 2), count - limit));
};

/** Moves a cursor by `delta`, wrapping around single steps and clamping page jumps. */
export const moveIndex = (count: number, index: number, delta: number): number => {
  if (count === 0) return 0;
  if (Math.abs(delta) === 1) return (index + delta + count) % count;
  return Math.max(0, Math.min(count - 1, index + delta));
};

export interface SearchableItem {
  hint?: string;
  keywords?: string[];
  label: string;
  value: string;
}

/**
 * Case-insensitive match on label, value, hint and keywords; items whose label or value starts
 * with the query come first, otherwise the original order is kept.
 */
export const filterItems = <T extends SearchableItem>(items: T[], query: string): T[] => {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return items;

  const prefix: T[] = [];
  const rest: T[] = [];
  for (const item of items) {
    const label = item.label.toLowerCase();
    const value = item.value.toLowerCase();
    if (label.startsWith(keyword) || value.startsWith(keyword)) prefix.push(item);
    else if (
      [label, value, item.hint, ...(item.keywords ?? [])].some((text) =>
        text?.toLowerCase().includes(keyword),
      )
    )
      rest.push(item);
  }
  return [...prefix, ...rest];
};

/** Strips control characters from raw key input so only printable text reaches a query. */
export const printable = (input: string) =>
  [...input]
    .filter((char) => {
      const code = char.codePointAt(0)!;
      return code >= 0x20 && code !== 0x7F;
    })
    .join('');
