import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import { useTheme } from '@/hooks/useTheme';
import genAiCommit from '@/utils/genAiCommit';

const Ai = memo(() => {
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    genAiCommit().then((text: any) => {
      setMessage(text);
    });
  }, []);

  return (
    <Box borderColor={theme.colorBorder} borderStyle="round" paddingLeft={2} paddingRight={2}>
      {message ? <Text>{message}</Text> : <Spinner label=" Generating..." />}
    </Box>
  );
});

export default Ai;
