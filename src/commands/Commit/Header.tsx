import { Box, Text } from 'ink';
import React from 'react';

interface HeaderProps {
  step: number;
  steps: any[];
}
const Header: React.FC<HeaderProps> = ({ step, steps }) => {
  return (
    <Box justifyContent="center" borderStyle="round" borderColor="#333">
      <Text color="#000" backgroundColor="#fff">
        {` ${step + 1}/${steps.length} `}
      </Text>
      <Text> </Text>
      <Text>{steps[step].title}</Text>
    </Box>
  );
};

export default React.memo(Header);
