import { type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';

const theme = {
  styles: {
    container: ({ color }: Pick<TextProps, 'color'>): TextProps => ({
      backgroundColor: color,
    }),
    label: (): TextProps => ({
      color: 'black',
    }),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
