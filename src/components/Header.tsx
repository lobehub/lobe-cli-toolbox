import { Box, Text } from 'ink';
import { memo } from 'react';

export interface HeaderProps {
  title: string;
}
const Header = memo<HeaderProps>(({ title }) => {
  return (
    <Box borderColor="#333" borderStyle="round" justifyContent="center">
      <Text>{title}</Text>
    </Box>
  );
});

export default Header;
