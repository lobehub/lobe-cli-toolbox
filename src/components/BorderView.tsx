import { Box } from 'ink';
import { memo, type ReactNode } from 'react';

interface BorderViewProps {
  children: ReactNode;
}
const BorderView = memo<BorderViewProps>(({ children }) => (
  <Box
    borderColor="#333"
    borderStyle="round"
    flexDirection={'column'}
    paddingLeft={1}
    paddingRight={1}
  >
    {children}
  </Box>
));

export default BorderView;
