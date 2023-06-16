import { Spinner } from '@inkjs/ui';
import { Text } from 'ink';
import SelectInput from 'ink-select-input';
import { memo, useEffect, useState } from 'react';

import { BorderView, Header, View } from '../../components';
import genAiCommit from '../../utils/genAiCommit';
import RunGitCommit from './RunGitCommit';

interface AiCommitProps {
  hook?: boolean;
}

const AiCommit = memo<AiCommitProps>(({ hook }) => {
  const [count, setCount] = useState<number>(0);
  const [message, setMessage] = useState<string>('');
  const [runCommit, setRunCommit] = useState<boolean>(false);
  useEffect(() => {
    genAiCommit().then((text: any) => {
      setMessage(text);
    });
  }, [count]);

  const handleSelect = (item: any) => {
    if (item.value === 'reload') {
      setMessage('');
      setCount(count + 1);
    } else if (item.value === 'confirm') {
      setRunCommit(true);
    }
  };

  if (runCommit) return <RunGitCommit hook={hook} message={message} />;

  return (
    <>
      <Header title={`🤯 AI Commit Generator`} />
      <BorderView>
        {message ? <Text>{message}</Text> : <Spinner label=" Generating..." />}
        {message ? (
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
});

export default AiCommit;
