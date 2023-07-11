import { Box } from 'ink';
import { type ReactNode, memo } from 'react';

import { useTheme } from '@/hooks/useTheme';

export interface BorderViewProps {
  children: ReactNode;
}
const BorderView = memo<BorderViewProps>(({ children }) => {
  const theme = useTheme();
  return (
    <Box
      borderColor={theme.colorBorder}
      borderStyle="round"
      flexDirection={'column'}
      paddingLeft={1}
      paddingRight={1}
    >
      {children}
    </Box>
  );
});

export default BorderView;
