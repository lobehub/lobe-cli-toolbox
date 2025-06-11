import figures from 'figures';
import { type BoxProps, type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';

const theme = {
  config: () => ({
    // Character for rendering a completed bar
    completedCharacter: figures.square,

    // Character for rendering a remaining bar
    remainingCharacter: figures.squareLightShade,
  }),
  styles: {
    completed: (): TextProps => ({
      color: 'magenta',
    }),
    container: (): BoxProps => ({
      flexGrow: 1,
      minWidth: 0,
    }),
    remaining: (): TextProps => ({
      dimColor: true,
    }),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
