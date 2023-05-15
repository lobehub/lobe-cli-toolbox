import { Box, Text } from 'ink';
import React from 'react';
import gitmojis from '../../constants/gitmojis-lite';

const List: React.FC = () => (
  <>
    {gitmojis.map((item) => (
      <Box key={item.name}>
        <Box>
          <Text>{item.emoji}</Text>
          <Text>{Array.from({ length: item.emoji.length + 1 }).join('1')}</Text>
        </Box>

        <Box width={16}>
          <Text>{item.description.split(': ')[0]}</Text>
        </Box>
        <Text>{item.description.split(': ')[1]}</Text>
      </Box>
    ))}
  </>
);

export default List;
