import { Text, useAnimation } from 'ink';
import type { ReactNode } from 'react';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];

export interface SpinnerProps {
  color?: string;
  label?: ReactNode;
}

export const Spinner = memo<SpinnerProps>(({ color, label }) => {
  const theme = useTheme();
  const { frame } = useAnimation({ interval: 80 });
  return (
    <Text>
      <Text color={color ?? theme.colorPrimary}>{FRAMES[frame % FRAMES.length]}</Text>
      {label !== undefined && <Text> {label}</Text>}
    </Text>
  );
});

export default Spinner;
