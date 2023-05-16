import { Box, Text } from 'ink';
import React, { Fragment } from 'react';
import gitmojis from '../../constants/gitmojis';

const List: React.FC = () => (
  <>
    {gitmojis.map((item) => (
      <Fragment key={item.name}>
        <Box>
          <Box marginRight={1} width={20}>
            <Text backgroundColor="#000" color="#fff">
              {` ${item.emoji} ${item.type} `}
            </Text>
          </Box>
          <Box marginRight={1} width={40}>
            <Text color="#999">{`- ${item.descEN}`}</Text>
          </Box>
          <Box>
            <Text color="#999">{item.descCN}</Text>
          </Box>
        </Box>
      </Fragment>
    ))}
  </>
);

export default React.memo(List);
