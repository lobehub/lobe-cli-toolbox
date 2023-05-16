import { Spinner } from '@inkjs/ui';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useEffect, useState } from 'react';
import generateSingleCommit from '../../utils/generateSingleCommit';
import RunGitCommit from './RunGitCommit.js';

interface AiCommitProps {
  hook?: boolean;
}

const AiCommit: React.FC<AiCommitProps> = ({ hook }) => {
  const [count, setCount] = useState<number>(0);
  const [msg, setMsg] = useState<string>('');
  const [runCommit, setRunCommit] = useState<boolean>(false);
  useEffect(() => {
    generateSingleCommit().then((text: any) => {
      setMsg(text);
    });
  }, [count]);

  const handleSelect = (item: any) => {
    if (item.value === 'reload') {
      setMsg('');
      setCount(count + 1);
    } else if (item.value === 'confirm') {
      setRunCommit(true);
    }
  };

  if (runCommit) return <RunGitCommit hook={hook} message={msg} />;

  return (
    <>
      <Box borderStyle="round" borderColor="#333" paddingLeft={2} paddingRight={2}>
        {msg ? <Text>{msg}</Text> : <Spinner label=" Generating..." />}
      </Box>
      {msg ? (
        <SelectInput
          items={[
            { label: '🔄️ Regenerate commit message', value: 'reload' },
            { label: '✅ Use this message', value: 'confirm' },
          ]}
          onSelect={handleSelect}
        />
      ) : (
        <Text></Text>
      )}
    </>
  );
};

export default React.memo(AiCommit);
