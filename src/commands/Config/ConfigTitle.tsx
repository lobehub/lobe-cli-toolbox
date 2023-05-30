import { Badge } from '@inkjs/ui';
import { Text } from 'ink';
import { memo } from 'react';

interface ConfigTitleProps {
  badge: string;
  color: string;
  title: string;
}

const ConfigTitle = memo<ConfigTitleProps>(({ title, color, badge }) => {
  const newTitle = title + new Array(30 - title.length).fill(null).join(' ');
  return (
    <Text>
      {`${newTitle} `}
      <Badge color={color}>{badge}</Badge>
    </Text>
  );
});

export default ConfigTitle;
