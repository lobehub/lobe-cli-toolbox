import { Box } from 'ink';
import { type ReactNode, memo } from 'react';

import { useTheme } from '@/hooks/useTheme';

export interface SplitViewProps {
  children: ReactNode;
}
const SplitView = memo<SplitViewProps>(({ children }) => {
  const theme = useTheme();
  return (
    <Box
      borderBottom={false}
      borderColor={theme.colorBorder}
      borderLeft={false}
      borderRight={false}
      borderStyle={'single'}
      flexDirection={'column'}
    >
      {children}
    </Box>
  );
});

export default SplitView;
