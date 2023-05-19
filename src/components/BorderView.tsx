import { Box } from 'ink';
import React from 'react';

interface BorderViewProps {
  children: React.ReactNode;
}
const BorderView: React.FC<BorderViewProps> = ({ children }) => (
  <Box
    borderStyle="round"
    borderColor="gray"
    paddingLeft={1}
    paddingRight={1}
    flexDirection={'column'}
  >
    {children}
  </Box>
);

export default React.memo(BorderView);
