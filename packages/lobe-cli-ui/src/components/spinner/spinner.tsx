import { Box, Text } from 'ink';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';
import { type UseSpinnerProps, useSpinner } from './use-spinner';

export type SpinnerProps = UseSpinnerProps & {
  /**
   * Label to show near the spinner.
   */
  readonly label?: string;
};

export function Spinner({ label, type }: SpinnerProps) {
  const { frame } = useSpinner({ type });
  const { styles } = useComponentTheme<Theme>('Spinner');

  return (
    <Box {...styles.container()}>
      <Text {...styles.frame()}>{frame}</Text>
      {label && <Text {...styles.label()}>{label}</Text>}
    </Box>
  );
}
