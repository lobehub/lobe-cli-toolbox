import { Box, Text } from 'ink';
import { type ReactNode, useContext } from 'react';

import { useComponentTheme } from '../../theme';
import { OrderedListItemContext } from './ordered-list-item-context';
import { type Theme } from './theme';

export type OrderedListItemProps = {
  /**
   * List item content.
   */
  readonly children: ReactNode;
};

export function OrderedListItem({ children }: OrderedListItemProps) {
  const { marker } = useContext(OrderedListItemContext);
  const { styles } = useComponentTheme<Theme>('OrderedList');

  return (
    <Box {...styles.listItem()}>
      <Text {...styles.marker()}>{marker}</Text>
      <Box {...styles.content()}>{children}</Box>
    </Box>
  );
}
