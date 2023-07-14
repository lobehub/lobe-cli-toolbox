import { Panel, useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo } from 'react';

import { I18nConfig } from '@/types/config';

import QueryItem, { type QueryItemProps } from './QueryItem';

interface Props {
  config: I18nConfig;
  query: QueryItemProps[];
}

const App = memo<Props>(({ query, config }) => {
  const theme = useTheme();
  return (
    <Panel title={`🤯 lobe i18n`}>
      <Text color={theme.colorTextDescription}>Start running translate query:</Text>
      {query.map((item, index) => (
        <QueryItem config={config} item={item} key={index} />
      ))}
    </Panel>
  );
});

export default App;
