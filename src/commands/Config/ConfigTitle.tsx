import { Badge } from '@inkjs/ui';
import { Text } from 'ink';
import React from 'react';
interface ConfigTitleProps {
  title: string;
  color: string;
  badge: string;
}

const ConfigTitle: React.FC<ConfigTitleProps> = ({ title, color, badge }) => {
  const newTitle = title + new Array(30 - title.length).fill(null).join(' ');
  return (
    <Text>
      {`${newTitle} `}
      <Badge color={color}>{badge}</Badge>
    </Text>
  );
};

export default React.memo(ConfigTitle);
