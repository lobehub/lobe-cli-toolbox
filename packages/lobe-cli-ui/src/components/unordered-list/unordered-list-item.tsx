import { Box, Text } from 'ink';
import { type ReactNode, useContext } from 'react';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';
import { UnorderedListItemContext } from './unordered-list-item-context';

export type UnorderedListItemProps = {
  /**
   * List item content.
   */
  readonly children: ReactNode;
};

export function UnorderedListItem({ children }: UnorderedListItemProps) {
  const { marker } = useContext(UnorderedListItemContext);
  const { styles } = useComponentTheme<Theme>('UnorderedList');

  return (
    <Box {...styles.listItem()}>
      <Text {...styles.marker()}>{marker}</Text>
      <Box {...styles.content()}>{children}</Box>
    </Box>
  );
}
