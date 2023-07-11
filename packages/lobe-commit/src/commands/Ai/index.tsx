import { Spinner } from '@inkjs/ui';
import { useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import genAiCommit from '@/utils/genAiCommit';

const Ai = memo(() => {
  const [loadingInfo, setLoadingInfo] = useState<string>(' Generating...');
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    genAiCommit(setLoadingInfo).then((text: any) => {
      setMessage(text);
    });
  }, []);

  return (
    <Box borderColor={theme.colorBorder} borderStyle="round" paddingLeft={2} paddingRight={2}>
      {message ? <Text>{message}</Text> : <Spinner label={loadingInfo} />}
    </Box>
  );
});

export default Ai;
