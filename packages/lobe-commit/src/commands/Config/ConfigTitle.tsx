import { Badge } from '@inkjs/ui';
import { Text } from 'ink';
import { memo } from 'react';

interface ConfigTitleProps {
  badge: string;
  color: string;
  title: string;
}

const ConfigTitle = memo<ConfigTitleProps>(({ title, color, badge }) => {
  const newTitle =
    title +
    Array.from({ length: 30 - title.length })
      .fill('')
      .join(' ');
  return (
    <Text>
      {`${newTitle} `}
      <Badge color={color}>{badge}</Badge>
    </Text>
  );
});

export default ConfigTitle;
