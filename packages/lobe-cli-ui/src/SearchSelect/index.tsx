import { Box, type Key, Text, useInput } from 'ink';
import type { ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { KeyHint } from '../KeyHints';
import { filterItems, moveIndex, printable, type SearchableItem } from '../lib/list';
import OptionList, { type OptionListItem, useListLimit } from '../OptionList';
import { useHighlight } from '../SelectInput';
import symbols from '../styles/symbols';

export type SearchSelectItem = SearchableItem;

interface BaseProps {
  emptyText?: ReactNode;
  isFocused?: boolean;
  items: SearchSelectItem[];
  labelWidth?: number;
  limit?: number;
  /** Esc with an empty query. */
  onCancel?: () => void;
  placeholder?: string;
}

export interface SearchSelectProps extends BaseProps {
  /** Offer the typed text as an extra option when no item has exactly that value. */
  allowCustom?: boolean;
  customLabel?: (query: string) => string;
  initialValue?: string;
  onSelect: (value: string) => void;
}

export interface MultiSearchSelectProps extends BaseProps {
  defaultValue?: string[];
  onChange?: (values: string[]) => void;
  onSubmit: (values: string[]) => void;
}

export const searchSelectHints: KeyHint[] = [
  ['type', 'filter'],
  ['↑↓', 'move'],
  ['enter', 'select'],
  ['esc', 'back'],
];

export const multiSearchSelectHints: KeyHint[] = [
  ['type', 'filter'],
  ['space', 'toggle'],
  ['enter', 'confirm'],
  ['esc', 'back'],
];

const CUSTOM_KEY = '\u0000custom';

const QueryLine = memo<{ count: number; placeholder: string; query: string; total: number }>(
  ({ count, placeholder, query, total }) => {
    const theme = useTheme();
    return (
      <Box>
        <Text color={theme.colorPrimary}>{`${symbols.pointer} `}</Text>
        <Text>{query}</Text>
        <Text inverse> </Text>
        {query ? (
          <Text dimColor>{`  ${count}/${total}`}</Text>
        ) : (
          <Text dimColor>{placeholder}</Text>
        )}
      </Box>
    );
  },
);

/**
 * Query editing plus cursor movement over `options`. Returns `true` from `handleKey` when the key
 * was consumed. Editing the query moves the cursor to the best match.
 */
const useSearchList = <T extends OptionListItem>(
  options: T[],
  query: string,
  setQuery: (query: string) => void,
  limit: number,
  initialValue?: string,
) => {
  const { index, setIndex } = useHighlight(options, initialValue);

  const updateQuery = (next: string) => {
    setQuery(next);
    setIndex(-1);
  };

  const handleKey = (input: string, key: Key): boolean => {
    const count = options.length;
    if (key.upArrow) setIndex(moveIndex(count, index, -1));
    else if (key.downArrow) setIndex(moveIndex(count, index, 1));
    else if (key.pageUp) setIndex(moveIndex(count, index, -limit));
    else if (key.pageDown) setIndex(moveIndex(count, index, limit));
    else if (key.backspace || key.delete) updateQuery(query.slice(0, -1));
    else if (key.ctrl && input === 'u') updateQuery('');
    else if (!key.ctrl && !key.meta && !key.escape && !key.tab && !key.return && printable(input))
      updateQuery(query + printable(input));
    else return false;
    return true;
  };

  return { handleKey, index, updateQuery };
};

/** Type to filter, ↑↓ to move, enter to select, esc clears the query and then goes back. */
const SearchSelect = memo<SearchSelectProps>(
  ({
    allowCustom,
    customLabel = (query) => `Use "${query}"`,
    emptyText = 'No match',
    initialValue,
    isFocused = true,
    items,
    labelWidth,
    limit: maxLimit,
    onCancel,
    onSelect,
    placeholder = 'Type to search',
  }) => {
    const limit = useListLimit(maxLimit);
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => filterItems(items, query), [items, query]);

    const trimmed = query.trim();
    const options: OptionListItem[] =
      !allowCustom || !trimmed || items.some((item) => item.value === trimmed)
        ? filtered
        : [...filtered, { key: CUSTOM_KEY, label: customLabel(trimmed), value: trimmed }];

    const { handleKey, index, updateQuery } = useSearchList(
      options,
      query,
      setQuery,
      limit,
      initialValue,
    );

    useInput(
      (input, key) => {
        if (key.escape) {
          if (query) updateQuery('');
          else onCancel?.();
        } else if (key.return) {
          const item = options[index];
          if (item) onSelect(item.value);
        } else {
          handleKey(input, key);
        }
      },
      { isActive: isFocused },
    );

    return (
      <Box flexDirection="column">
        <QueryLine
          count={filtered.length}
          placeholder={placeholder}
          query={query}
          total={items.length}
        />
        <Box marginTop={1}>
          <OptionList
            activeIndex={index}
            emptyText={emptyText}
            items={options}
            labelWidth={labelWidth}
            limit={limit}
          />
        </Box>
      </Box>
    );
  },
);

export default SearchSelect;

/** Like `SearchSelect`, with space to toggle items and enter to submit the selection. */
export const MultiSearchSelect = memo<MultiSearchSelectProps>(
  ({
    defaultValue = [],
    emptyText = 'No match',
    isFocused = true,
    items,
    labelWidth,
    limit: maxLimit,
    onCancel,
    onChange,
    onSubmit,
    placeholder = 'Type to search',
  }) => {
    const limit = useListLimit(maxLimit);
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => filterItems(items, query), [items, query]);
    const { handleKey, index, updateQuery } = useSearchList(filtered, query, setQuery, limit);
    const [selected, setSelected] = useState(() => new Set(defaultValue.filter(Boolean)));

    const ordered = (set: Set<string>) =>
      items.map((item) => item.value).filter((value) => set.has(value));

    useInput(
      (input, key) => {
        if (key.escape) {
          if (query) updateQuery('');
          else onCancel?.();
        } else if (key.return) {
          onSubmit(ordered(selected));
        } else if (input === ' ' || key.tab) {
          const item = filtered[index];
          if (!item) return;
          const next = new Set(selected);
          if (next.has(item.value)) next.delete(item.value);
          else next.add(item.value);
          setSelected(next);
          onChange?.(ordered(next));
        } else {
          handleKey(input, key);
        }
      },
      { isActive: isFocused },
    );

    return (
      <Box flexDirection="column">
        <QueryLine
          count={filtered.length}
          placeholder={placeholder}
          query={query}
          total={items.length}
        />
        <Box marginTop={1}>
          <OptionList
            multiple
            activeIndex={index}
            emptyText={emptyText}
            isSelected={(item) => selected.has(item.value)}
            items={filtered}
            labelWidth={labelWidth}
            limit={limit}
          />
        </Box>
      </Box>
    );
  },
);
