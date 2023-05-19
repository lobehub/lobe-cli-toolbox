import { Box, Text } from 'ink';
import React from 'react';

export interface HeaderProps {
  title: string;
}
const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <Box justifyContent="center" borderStyle="round" borderColor="#333">
      <Text>{title}</Text>
    </Box>
  );
};

export default React.memo(Header);
