import figures from 'figures';
import { Box, Text } from 'ink';
import { memo } from 'react';

export interface IndicatorProps {
  highlightColor: string;
  isSelected?: boolean;
}

const Indicator = memo<IndicatorProps>(({ highlightColor, isSelected = false }) => {
  return (
    <Box marginRight={1}>
      {isSelected ? <Text color={highlightColor}>{figures.pointer}</Text> : <Text> </Text>}
    </Box>
  );
});

export default Indicator;
