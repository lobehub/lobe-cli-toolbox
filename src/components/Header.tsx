import { Box, Text } from 'ink';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';

export interface HeaderProps {
  title: string;
}
const Header = memo<HeaderProps>(({ title }) => {
  const theme = useTheme();
  return (
    <Box borderColor={theme.colorBorder} borderStyle="round" justifyContent="center">
      <Text>{title}</Text>
    </Box>
  );
});

export default Header;
