import { Box, type DOMElement, measureElement, Text } from 'ink';
import { useState } from 'react';

import { useComponentTheme } from '../../theme';
import { type Theme } from './theme';

export type ProgressBarProps = {
  /**
   * Progress.
   * Must be between 0 and 100.
   *
   * @default 0
   */
  readonly value: number;
};

export function ProgressBar({ value }: ProgressBarProps) {
  const [width, setWidth] = useState(0);

  const [ref, setRef] = useState<DOMElement | null>(null);

  if (ref) {
    const dimensions = measureElement(ref);

    if (dimensions.width !== width) {
      setWidth(dimensions.width);
    }
  }

  const progress = Math.min(100, Math.max(0, value));
  const complete = Math.round((progress / 100) * width);
  const remaining = width - complete;

  const { styles, config } = useComponentTheme<Theme>('ProgressBar');

  return (
    <Box ref={setRef} {...styles.container()}>
      {complete > 0 && (
        <Text {...styles.completed()}>{config().completedCharacter.repeat(complete)}</Text>
      )}

      {remaining > 0 && (
        <Text {...styles.remaining()}>{config().remainingCharacter.repeat(remaining)}</Text>
      )}
    </Box>
  );
}
