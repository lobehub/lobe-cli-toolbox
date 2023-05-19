import { Spinner } from '@inkjs/ui';
import { Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useEffect, useState } from 'react';
import { BorderView, Header, View } from '../../components';
import genAiCommit from '../../utils/genAiCommit';
import RunGitCommit from './RunGitCommit';

interface AiCommitProps {
  hook?: boolean;
}

const AiCommit: React.FC<AiCommitProps> = ({ hook }) => {
  const [count, setCount] = useState<number>(0);
  const [msg, setMsg] = useState<string>('');
  const [runCommit, setRunCommit] = useState<boolean>(false);
  useEffect(() => {
    genAiCommit().then((text: any) => {
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
      <Header title={`🤯 AI Commit Generator`} />
      <BorderView>
        {msg ? <Text>{msg}</Text> : <Spinner label=" Generating..." />}
        {msg ? (
          <View>
            <SelectInput
              items={[
                { label: '🔄️ Regenerate commit message', value: 'reload' },
                { label: '✅ Use this message', value: 'confirm' },
              ]}
              onSelect={handleSelect}
            />
          </View>
        ) : (
          <Text />
        )}
      </BorderView>
    </>
  );
};

export default React.memo(AiCommit);
