import { Box, Text } from 'ink';
import { memo } from 'react';

interface StepHeaderProps {
  step: number;
  steps: any[];
}
const StepHeader = memo<StepHeaderProps>(({ step, steps }) => {
  return (
    <Box borderColor="#333" borderStyle="round" justifyContent="center">
      <Text backgroundColor="#fff" color="#000">
        {` ${step + 1}/${steps.length} `}
      </Text>
      <Text> </Text>
      <Text>{steps[step].title}</Text>
    </Box>
  );
});

export default StepHeader;
