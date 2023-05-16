import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import React, { useEffect, useState } from 'react';
import generateSingleCommit from '../../utils/generateSingleCommit';

const Ai: React.FC = () => {
  const [msg, setMsg] = useState<string>('');
  useEffect(() => {
    generateSingleCommit().then((text: any) => {
      setMsg(text);
    });
  }, []);

  return (
    <Box borderStyle="round" borderColor="#333" paddingLeft={2} paddingRight={2}>
      {msg ? <Text>{msg}</Text> : <Spinner label=" Generating..." />}
    </Box>
  );
};

export default React.memo(Ai);
