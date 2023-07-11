import { Spinner } from '@inkjs/ui';
import { Panel, SelectInput } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { memo, useCallback, useEffect, useState } from 'react';

import { useCommitStore } from '@/store/commitStore';
import genAiCommit from '@/utils/genAiCommit';

const AiCommit = memo(() => {
  const { message, setMessage, setStep } = useCommitStore((st) => ({
    message: st.message,
    setMessage: st.setMessage,
    setStep: st.setStep,
  }));
  useInput(useCallback((_, key) => key.tab && setStep('feat'), []));
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingInfo, setLoadingInfo] = useState<string>(' Generating...');
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    genAiCommit(setLoadingInfo).then((text: any) => {
      setMessage(text);
      setLoading(false);
      setLoadingInfo(' Generating...');
    });
  }, [count]);

  const handleSelect = useCallback(
    (item: any) => {
      if (item.value === 'reload') {
        setMessage('');
        setCount(count + 1);
        setLoading(true);
      } else if (item.value === 'confirm') {
        setStep('commit');
      }
    },
    [count],
  );

  return (
    <Panel
      footer={
        !loading &&
        message && (
          <SelectInput
            items={[
              { label: '🔄️ Regenerate commit message', value: 'reload' },
              { label: '✅ Use this message', value: 'confirm' },
            ]}
            onSelect={handleSelect}
          />
        )
      }
      reverse
      title={`🤯 AI Commit Generator`}
    >
      {!loading && message ? <Text>{message}</Text> : <Spinner label={loadingInfo} />}
    </Panel>
  );
});

export default AiCommit;
