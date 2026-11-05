import { useInput } from 'ink';
import { memo, useEffect, useEffectEvent, useState } from 'react';

import { moveIndex } from '../lib/list';
import OptionList, { type OptionListItem, useListLimit } from '../OptionList';

export type SelectInputItem = OptionListItem;

export interface SelectInputProps {
  initialIndex?: number;
  /** Highlight the item with this value first, wins over `initialIndex`. */
  initialValue?: string;
  isFocused?: boolean;
  items?: SelectInputItem[];
  labelWidth?: number;
  limit?: number;
  /** Called for the highlighted item, including the first one on mount. */
  onHighlight?: (item: SelectInputItem) => void;
  onSelect?: (item: SelectInputItem) => void;
}

/**
 * Tracks the highlighted item by value, so it survives the item list changing (e.g. a filter);
 * falls back to the first item when it is gone.
 */
export const useHighlight = (items: { value: string }[], initialValue?: string) => {
  const [value, setValue] = useState(initialValue);
  const found = items.findIndex((item) => item.value === value);
  const index = found >= 0 ? found : 0;
  const setIndex = (next: number) => setValue(items[next]?.value);
  return { index, setIndex };
};

/** ↑↓ to move (wraps), pgup/pgdn/home/end to jump, enter to select. */
const SelectInput = memo<SelectInputProps>(
  ({
    initialIndex = 0,
    initialValue,
    isFocused = true,
    items = [],
    labelWidth,
    limit: maxLimit,
    onHighlight,
    onSelect,
  }) => {
    const limit = useListLimit(maxLimit);
    const { index, setIndex } = useHighlight(
      items,
      initialValue ?? items[Math.min(Math.max(initialIndex, 0), items.length - 1)]?.value,
    );
    const current = items[index];

    const emitHighlight = useEffectEvent(() => {
      if (current) onHighlight?.(current);
    });
    useEffect(() => {
      emitHighlight();
    }, [current?.value]);

    useInput(
      (_, key) => {
        const count = items.length;
        if (key.upArrow) setIndex(moveIndex(count, index, -1));
        else if (key.downArrow) setIndex(moveIndex(count, index, 1));
        else if (key.pageUp) setIndex(moveIndex(count, index, -limit));
        else if (key.pageDown) setIndex(moveIndex(count, index, limit));
        else if (key.home) setIndex(0);
        else if (key.end) setIndex(count - 1);
        else if (key.return && current) onSelect?.(current);
      },
      { isActive: isFocused },
    );

    return <OptionList activeIndex={index} items={items} labelWidth={labelWidth} limit={limit} />;
  },
);

export default SelectInput;
