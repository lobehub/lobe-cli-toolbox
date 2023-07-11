import arrayRotate from 'arr-rotate';
import isEqual from 'fast-deep-equal';
import { Box, useInput } from 'ink';
import { type FC, createElement, memo } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useTheme } from '@/hooks/useTheme';

import Indicator from './Indicator.js';
import type { IndicatorProps } from './Indicator.js';
import ItemComponent from './Item.js';
import type { ItemProps } from './Item.js';

export interface SelectInputItem {
  key?: string;
  label: string;
  value: string;
}

export interface SelectInputProps {
  highlightColor?: string;
  indicatorComponent?: FC<IndicatorProps>;
  initialIndex?: number;
  isFocused?: boolean;
  itemComponent?: FC<ItemProps>;
  items?: SelectInputItem[];
  limit?: number;
  onHighlight?: (item: SelectInputItem) => void;
  onSelect?: (item: SelectInputItem) => void;
}

const SelectInput = memo<SelectInputProps>(
  ({
    highlightColor,
    items = [],
    isFocused = true,
    initialIndex = 0,
    indicatorComponent = Indicator,
    itemComponent = ItemComponent,
    limit: customLimit,
    onSelect,
    onHighlight,
  }) => {
    const theme = useTheme();
    const hasLimit = typeof customLimit === 'number' && items.length > customLimit;
    const limit = hasLimit ? Math.min(customLimit, items.length) : items.length;
    const lastIndex = limit - 1;
    const [rotateIndex, setRotateIndex] = useState(
      initialIndex > lastIndex ? lastIndex - initialIndex : 0,
    );
    const [selectedIndex, setSelectedIndex] = useState(
      initialIndex ? (initialIndex > lastIndex ? lastIndex : initialIndex) : 0,
    );
    const previousItems = useRef<SelectInputItem[]>(items);

    useEffect(() => {
      if (
        !isEqual(
          previousItems.current.map((item) => item.value),
          items.map((item) => item.value),
        )
      ) {
        setRotateIndex(0);
        setSelectedIndex(0);
      }

      previousItems.current = items;
    }, [items]);

    useInput(
      useCallback(
        (input, key) => {
          if (input === 'k' || key.upArrow) {
            const lastIndex = (hasLimit ? limit : items.length) - 1;
            const atFirstIndex = selectedIndex === 0;
            const nextIndex = hasLimit ? selectedIndex : lastIndex;
            const nextRotateIndex = atFirstIndex ? rotateIndex + 1 : rotateIndex;
            const nextSelectedIndex = atFirstIndex ? nextIndex : selectedIndex - 1;

            setRotateIndex(nextRotateIndex);
            setSelectedIndex(nextSelectedIndex);

            const slicedItems = hasLimit
              ? arrayRotate(items, nextRotateIndex).slice(0, limit)
              : items;

            if (typeof onHighlight === 'function') {
              onHighlight(slicedItems[nextSelectedIndex]!);
            }
          }

          if (input === 'j' || key.downArrow) {
            const atLastIndex = selectedIndex === (hasLimit ? limit : items.length) - 1;
            const nextIndex = hasLimit ? selectedIndex : 0;
            const nextRotateIndex = atLastIndex ? rotateIndex - 1 : rotateIndex;
            const nextSelectedIndex = atLastIndex ? nextIndex : selectedIndex + 1;

            setRotateIndex(nextRotateIndex);
            setSelectedIndex(nextSelectedIndex);

            const slicedItems = hasLimit
              ? arrayRotate(items, nextRotateIndex).slice(0, limit)
              : items;

            if (typeof onHighlight === 'function') {
              onHighlight(slicedItems[nextSelectedIndex]!);
            }
          }

          if (key.return) {
            const slicedItems = hasLimit ? arrayRotate(items, rotateIndex).slice(0, limit) : items;

            if (typeof onSelect === 'function') {
              onSelect(slicedItems[selectedIndex]!);
            }
          }
        },
        [hasLimit, limit, rotateIndex, selectedIndex, items, onSelect, onHighlight],
      ),
      { isActive: isFocused },
    );

    const slicedItems = hasLimit ? arrayRotate(items, rotateIndex).slice(0, limit) : items;

    return (
      <Box flexDirection="column">
        {slicedItems.map((item, index) => {
          const isSelected = index === selectedIndex;

          return (
            <Box key={item.key ?? item.value}>
              {createElement(indicatorComponent, {
                highlightColor: highlightColor ?? theme.colorInfo,
                isSelected,
              })}
              {createElement(itemComponent, {
                ...item,
                highlightColor: highlightColor ?? theme.colorInfo,
                isSelected,
              })}
            </Box>
          );
        })}
      </Box>
    );
  },
);

export default SelectInput;
