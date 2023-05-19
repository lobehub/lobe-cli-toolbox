import { Box, Text } from 'ink';
import React from 'react';

interface StepHeaderProps {
  step: number;
  steps: any[];
}
const StepHeader: React.FC<StepHeaderProps> = ({ step, steps }) => {
  return (
    <Box justifyContent="center" borderStyle="round" borderColor="gray">
      <Text color="#000" backgroundColor="#fff">
        {` ${step + 1}/${steps.length} `}
      </Text>
      <Text> </Text>
      <Text>{steps[step].title}</Text>
    </Box>
  );
};

export default React.memo(StepHeader);
