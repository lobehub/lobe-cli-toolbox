import { Box } from 'ink';
import React from 'react';

interface ViewProps {
  children: React.ReactNode;
}
const View: React.FC<ViewProps> = ({ children }) => (
  <Box
    borderStyle="round"
    borderColor="#333"
    borderLeft={false}
    borderRight={false}
    borderBottom={false}
    flexDirection={'column'}
  >
    {children}
  </Box>
);

export default React.memo(View);
