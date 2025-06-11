import figures from 'figures';
import { type BoxProps, type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';
import { type StatusMessageVariant } from './types';

const colorByVariant = {
  error: 'red',
  info: 'blue',
  success: 'green',
  warning: 'yellow',
};

const iconByVariant = {
  error: figures.cross,
  info: figures.info,
  success: figures.tick,
  warning: figures.warning,
};

const theme = {
  config: ({ variant }: { variant: StatusMessageVariant }) => ({
    icon: iconByVariant[variant],
  }),
  styles: {
    container: (): BoxProps => ({
      gap: 1,
    }),
    icon: ({ variant }: { variant: StatusMessageVariant }): TextProps => ({
      color: colorByVariant[variant],
    }),
    iconContainer: (): BoxProps => ({
      flexShrink: 0,
    }),
    message: (): TextProps => ({}),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
