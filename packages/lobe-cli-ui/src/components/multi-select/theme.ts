import { type BoxProps, type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';

const theme = {
  styles: {
    container: (): BoxProps => ({
      flexDirection: 'column',
    }),
    focusIndicator: (): TextProps => ({
      color: 'blue',
    }),
    highlightedText: (): TextProps => ({
      bold: true,
    }),
    label({ isFocused, isSelected }): TextProps {
      let color: string | undefined;

      if (isSelected) {
        color = 'green';
      }

      if (isFocused) {
        color = 'blue';
      }

      return { color };
    },
    option: ({ isFocused }): BoxProps => ({
      gap: 1,
      paddingLeft: isFocused ? 0 : 2,
    }),
    selectedIndicator: (): TextProps => ({
      color: 'green',
    }),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
