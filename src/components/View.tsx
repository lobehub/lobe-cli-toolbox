import { Box } from 'ink';
import React from 'react';

interface ViewProps {
  children: React.ReactNode;
}
const View: React.FC<ViewProps> = ({ children }) => (
  <Box
    borderStyle="round"
    borderColor="gray"
    borderLeft={false}
    borderRight={false}
    borderBottom={false}
    flexDirection={'column'}
  >
    {children}
  </Box>
);

export default React.memo(View);
