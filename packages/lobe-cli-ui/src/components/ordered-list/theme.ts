import { type BoxProps, type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';

const theme = {
  styles: {
    content: (): BoxProps => ({
      flexDirection: 'column',
    }),
    list: (): BoxProps => ({
      flexDirection: 'column',
    }),
    listItem: (): BoxProps => ({
      gap: 1,
    }),
    marker: (): TextProps => ({
      dimColor: true,
    }),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
