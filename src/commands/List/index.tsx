import { Box, Text } from 'ink';
import React, { Fragment } from 'react';
import { BorderView } from '../../components/index.js';
import gitmojis from '../../constants/gitmojis';

const List: React.FC = () => (
  <BorderView>
    {gitmojis.map((item) => (
      <Fragment key={item.name}>
        <Box>
          <Box marginRight={1} width={20}>
            <Text backgroundColor="#000" color="#fff">
              {` ${item.emoji} ${item.type} `}
            </Text>
          </Box>
          <Text color="#999">{`- ${item.descEN}`}</Text>
        </Box>
      </Fragment>
    ))}
  </BorderView>
);

export default React.memo(List);
