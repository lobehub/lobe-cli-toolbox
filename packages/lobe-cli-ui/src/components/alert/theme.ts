import figures from 'figures';
import { type BoxProps, type TextProps } from 'ink';

import { type ComponentTheme } from '../../theme';

const colorByVariant: Record<string, string> = {
  error: 'red',
  info: 'blue',
  success: 'green',
  warning: 'yellow',
};

const theme = {
  config({ variant }) {
    let icon: string | undefined;

    if (variant === 'info') {
      icon = figures.info;
    }

    if (variant === 'success') {
      icon = figures.tick;
    }

    if (variant === 'error') {
      icon = figures.cross;
    }

    if (variant === 'warning') {
      icon = figures.warning;
    }

    return { icon };
  },
  styles: {
    container: ({ variant }): BoxProps => ({
      borderColor: colorByVariant[variant],
      borderStyle: 'round',
      flexGrow: 1,
      gap: 1,
      paddingX: 1,
    }),
    content: (): BoxProps => ({
      flexDirection: 'column',
      flexGrow: 1,
      flexShrink: 1,
      gap: 1,
      minWidth: 0,
    }),
    icon: ({ variant }): TextProps => ({
      color: colorByVariant[variant],
    }),
    iconContainer: (): BoxProps => ({
      flexShrink: 0,
    }),
    message: (): TextProps => ({}),
    title: (): TextProps => ({
      bold: true,
    }),
  },
} satisfies ComponentTheme;

export default theme;
export type Theme = typeof theme;
