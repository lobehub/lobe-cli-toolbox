import figures from 'figures';
import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';

export type MultiSelectOptionProps = {
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

export function MultiSelectOption({ isFocused, isSelected, children }: MultiSelectOptionProps) {
  const { styles } = useComponentTheme<Theme>('MultiSelect');

  return (
    <Box {...styles.option({ isFocused })}>
      {isFocused && <Text {...styles.focusIndicator()}>{figures.pointer}</Text>}

      <Text {...styles.label({ isFocused, isSelected })}>{children}</Text>

      {isSelected && <Text {...styles.selectedIndicator()}>{figures.tick}</Text>}
    </Box>
  );
}
