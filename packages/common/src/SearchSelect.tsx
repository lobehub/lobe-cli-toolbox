import { Box, Text, useInput } from 'ink';
import { memo, useMemo, useState } from 'react';

export interface SearchSelectItem {
  hint?: string;
  label: string;
  value: string;
}

export interface SearchSelectProps {
  /**
   * Submit the typed text when nothing matches, e.g. a model id missing from the list.
   */
  allowCustom?: boolean;
  initialValue?: string;
  items: SearchSelectItem[];
  limit?: number;
  onSelect: (value: string) => void;
  placeholder?: string;
}

/**
 * Type to filter, arrows to move, enter to confirm.
 */
const SearchSelect = memo<SearchSelectProps>(
  ({ items, onSelect, allowCustom, initialValue, limit = 10, placeholder = 'Type to search' }) => {
    const [query, setQuery] = useState('');
    const [index, setIndex] = useState(() =>
      Math.max(
        0,
        items.findIndex((item) => item.value === initialValue),
      ),
    );

    const filtered = useMemo(() => {
      const keyword = query.trim().toLowerCase();
      if (!keyword) return items;
      return items.filter((item) =>
        [item.label, item.value, item.hint].some((text) => text?.toLowerCase().includes(keyword)),
      );
    }, [items, query]);

    const updateQuery = (next: string) => {
      setQuery(next);
      setIndex(0);
    };

    useInput((input, key) => {
      if (key.upArrow) {
        setIndex((i) => (i <= 0 ? Math.max(filtered.length - 1, 0) : i - 1));
      } else if (key.downArrow) {
        setIndex((i) => (i >= filtered.length - 1 ? 0 : i + 1));
      } else if (key.return) {
        const item = filtered[index];
        if (item) onSelect(item.value);
        else if (allowCustom && query.trim()) onSelect(query.trim());
      } else if (key.backspace || key.delete) {
        updateQuery(query.slice(0, -1));
      } else if (input && !key.ctrl && !key.meta && !key.escape && !key.tab) {
        updateQuery(query + input);
      }
    });

    const start = Math.max(0, Math.min(index - Math.floor(limit / 2), filtered.length - limit));
    const visible = filtered.slice(start, start + limit);

    return (
      <Box flexDirection="column">
        <Box>
          <Text color="cyan">{'🔍 '}</Text>
          {query ? <Text>{query}</Text> : <Text dimColor>{placeholder}</Text>}
        </Box>
        <Box flexDirection="column" marginTop={1}>
          {visible.map((item, i) => {
            const active = start + i === index;
            return (
              <Box key={item.value}>
                <Text color={active ? 'cyan' : undefined}>
                  {active ? '❯ ' : '  '}
                  {item.label}
                </Text>
                {item.hint && <Text dimColor>{`  ${item.hint}`}</Text>}
              </Box>
            );
          })}
          {filtered.length === 0 && (
            <Text dimColor>
              {allowCustom && query.trim()
                ? `No match, press enter to use "${query.trim()}"`
                : 'No match'}
            </Text>
          )}
          {filtered.length > visible.length && (
            <Text dimColor>{`  ... ${filtered.length} items`}</Text>
          )}
        </Box>
        <Box marginTop={1}>
          <Text dimColor>↑↓ select · type to filter · enter confirm · esc back</Text>
        </Box>
      </Box>
    );
  },
);

export default SearchSelect;
