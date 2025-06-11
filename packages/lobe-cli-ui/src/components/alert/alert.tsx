import { Box, Text } from 'ink';
import { type ReactNode } from 'react';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';

export type AlertProps = {
  /**
   * Message.
   */
  readonly children: ReactNode;

  /**
   * Title to show above the message.
   */
  readonly title?: string;

  /**
   * Variant, which determines the color of the alert.
   */
  readonly variant: 'info' | 'success' | 'error' | 'warning';
};

export function Alert({ children, variant, title }: AlertProps) {
  const { styles, config } = useComponentTheme<Theme>('Alert');

  return (
    <Box {...styles.container({ variant })}>
      <Box {...styles.iconContainer()}>
        <Text {...styles.icon({ variant })}>{config({ variant }).icon}</Text>
      </Box>

      <Box {...styles.content()}>
        {title && <Text {...styles.title()}>{title}</Text>}
        <Text {...styles.message()}>{children}</Text>
      </Box>
    </Box>
  );
}
