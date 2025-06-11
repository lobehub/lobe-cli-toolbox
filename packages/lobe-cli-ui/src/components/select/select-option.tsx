import figures from 'figures';
import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';

export type SelectOptionProps = {
  /**
   * Option label.
   */
  readonly children: ReactNode;

  /**
   * Determines if option is focused.
   */
  readonly isFocused: boolean;

  /**
   * Determines if option is selected.
   */
  readonly isSelected: boolean;
};

export function SelectOption({ isFocused, isSelected, children }: SelectOptionProps) {
  const { styles } = useComponentTheme<Theme>('Select');

  return (
    <Box {...styles.option({ isFocused })}>
      {isFocused && <Text {...styles.focusIndicator()}>{figures.pointer}</Text>}

      <Text {...styles.label({ isFocused, isSelected })}>{children}</Text>

      {isSelected && <Text {...styles.selectedIndicator()}>{figures.tick}</Text>}
    </Box>
  );
}
