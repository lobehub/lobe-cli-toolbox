import { Box, Text } from 'ink';
import { memo } from 'react';

import { useTheme } from '../../hooks/useTheme';

interface StepHeaderProps {
  step: number;
  steps: any[];
}
const StepHeader = memo<StepHeaderProps>(({ step, steps }) => {
  const theme = useTheme();
  return (
    <Box borderColor={theme.colorBorder} borderStyle="round" justifyContent="center">
      <Text backgroundColor={theme.colorText} color={theme.colorBgLayout}>
        {` ${step + 1}/${steps.length} `}
      </Text>
      <Text> </Text>
      <Text>{steps[step].title}</Text>
    </Box>
  );
});

export default StepHeader;
