import { useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo, useEffect, useState } from 'react';

const StreamingCursor = memo(() => {
  const [visible, setVisible] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return <Text color={theme.colorTextDescription}>{visible ? '▊' : ' '}</Text>;
});

export default StreamingCursor;
