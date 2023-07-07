import { Box, Text } from 'ink';
import { Fragment, memo } from 'react';

import { BorderView } from '../../components/index.js';
import gitmojis from '../../constants/gitmojis';
import { useTheme } from '../../hooks/useTheme';

const List = memo(() => {
  const theme = useTheme();
  return (
    <BorderView>
      {gitmojis.map((item) => (
        <Fragment key={item.name}>
          <Box>
            <Box marginRight={1} width={20}>
              <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
                {` ${item.emoji} ${item.type} `}
              </Text>
            </Box>
            <Text color={theme.colorTextDescription}>{`- ${item.descEN}`}</Text>
          </Box>
        </Fragment>
      ))}
    </BorderView>
  );
});

export default List;
