import { Text } from 'ink';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';
import symbols from '../styles/symbols';

export interface ProgressBarProps {
  color?: string;
  /** 0 – 100. */
  value: number;
  width?: number;
}

export const ProgressBar = memo<ProgressBarProps>(({ color, value, width = 24 }) => {
  const theme = useTheme();
  const complete = Math.round((Math.min(100, Math.max(0, value)) / 100) * width);
  return (
    <Text>
      <Text color={color ?? theme.colorPrimary}>{symbols.line.repeat(complete)}</Text>
      <Text color={theme.colorBorder}>{symbols.line.repeat(width - complete)}</Text>
    </Text>
  );
});

export default ProgressBar;
