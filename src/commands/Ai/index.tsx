import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import genAiCommit from '../../utils/genAiCommit';

const Ai = memo(() => {
  const [msg, setMsg] = useState<string>('');
  useEffect(() => {
    genAiCommit().then((text: any) => {
      setMsg(text);
    });
  }, []);

  return (
    <Box borderColor="#333" borderStyle="round" paddingLeft={2} paddingRight={2}>
      {msg ? <Text>{msg}</Text> : <Spinner label=" Generating..." />}
    </Box>
  );
});

export default Ai;
