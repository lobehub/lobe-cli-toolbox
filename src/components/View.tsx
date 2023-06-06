import { Box } from 'ink';
import { type ReactNode, memo } from 'react';

interface ViewProps {
  children: ReactNode;
}
const View = memo<ViewProps>(({ children }) => (
  <Box
    borderBottom={false}
    borderColor="#333"
    borderLeft={false}
    borderRight={false}
    borderStyle="round"
    flexDirection={'column'}
  >
    {children}
  </Box>
));

export default View;
