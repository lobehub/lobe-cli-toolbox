import { Box, type BoxProps } from 'ink';
import { type ReactNode, memo } from 'react';

import { useTheme } from '@/hooks/useTheme';

export interface SplitViewProps extends BoxProps {
  children: ReactNode;
  direction?: 'top' | 'bottom';
}
const SplitView = memo<SplitViewProps>(({ children, direction = 'top', ...props }) => {
  const theme = useTheme();
  return (
    <Box
      borderBottom={direction !== 'top'}
      borderColor={theme.colorBorder}
      borderLeft={false}
      borderRight={false}
      borderStyle={'single'}
      borderTop={direction === 'top'}
      flexDirection={'column'}
      {...props}
    >
      {children}
    </Box>
  );
});

export default SplitView;
