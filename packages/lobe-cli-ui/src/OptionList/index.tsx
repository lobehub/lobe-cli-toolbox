import { Box, Text, useWindowSize } from 'ink';
import type { ReactNode } from 'react';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';
import { getWindowStart } from '../lib/list';
import symbols from '../styles/symbols';

export interface OptionListItem {
  hint?: ReactNode;
  key?: string;
  label: ReactNode;
  value: string;
}

export interface OptionListProps {
  activeIndex: number;
  emptyText?: ReactNode;
  isSelected?: (item: OptionListItem) => boolean;
  items: OptionListItem[];
  /** Fixed width of the label column, so hints line up. */
  labelWidth?: number;
  limit?: number;
  /** Render checkboxes, for multi select. */
  multiple?: boolean;
}

/** Leaves room for the surrounding panel so the list never pushes the frame off screen. */
export const useListLimit = (limit = 10) => {
  const { rows } = useWindowSize();
  return Math.max(3, Math.min(limit, (rows || 24) - 10));
};

const OptionList = memo<OptionListProps>(
  ({ activeIndex, emptyText, isSelected, items, labelWidth, limit: maxLimit, multiple }) => {
    const theme = useTheme();
    const limit = useListLimit(maxLimit);

    if (items.length === 0) return emptyText ? <Text dimColor>{emptyText}</Text> : null;

    const start = getWindowStart(items.length, activeIndex, limit);
    const visible = items.slice(start, start + limit);
    const above = start;
    const below = items.length - start - visible.length;

    return (
      <Box flexDirection="column">
        {above > 0 && <Text dimColor>{`  ↑ ${above} more`}</Text>}
        {visible.map((item, i) => {
          const active = start + i === activeIndex;
          const selected = isSelected?.(item) ?? false;
          return (
            <Box key={item.key ?? item.value}>
              <Box flexShrink={0} width={2}>
                <Text color={theme.colorPrimary}>{active ? symbols.pointer : ' '}</Text>
              </Box>
              {multiple && (
                <Box flexShrink={0} width={2}>
                  <Text color={selected ? theme.colorPrimary : undefined} dimColor={!selected}>
                    {selected ? symbols.checkboxOn : symbols.checkboxOff}
                  </Text>
                </Box>
              )}
              <Box flexShrink={0} width={labelWidth}>
                <Text bold={active} color={active ? theme.colorPrimary : undefined}>
                  {item.label}
                </Text>
              </Box>
              {item.hint && (
                <Box flexShrink={1} marginLeft={labelWidth ? 0 : 2} minWidth={0}>
                  {typeof item.hint === 'string' ? (
                    <Text dimColor wrap="truncate-end">
                      {item.hint}
                    </Text>
                  ) : (
                    item.hint
                  )}
                </Box>
              )}
            </Box>
          );
        })}
        {below > 0 && <Text dimColor>{`  ↓ ${below} more`}</Text>}
      </Box>
    );
  },
);

export default OptionList;
