import { Panel, useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo } from 'react';

import gitmojis from '@/constants/gitmojis';

export interface ListItemProps {
  item: {
    descEN: string;
    emoji: string;
    name: string;
    type: string;
  };
}

export const ListItem = memo<ListItemProps>(({ item }) => {
  const theme = useTheme();
  return (
    <Box key={item.name}>
      <Box marginRight={1} width={20}>
        <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
          {` ${item.emoji} ${item.type} `}
        </Text>
      </Box>
      <Text color={theme.colorTextDescription}>{`- ${item.descEN}`}</Text>
    </Box>
  );
});

const List = memo(() => {
  return (
    <Panel title={`🤯 Gitmoji list`}>
      {gitmojis.map((item) => (
        <ListItem item={item} key={item.name} />
      ))}
    </Panel>
  );
});

export default List;
