import { Spinner } from '@inkjs/ui';
import { Panel, useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo, useCallback, useEffect, useState } from 'react';

import genAiCommit from '@/utils/genAiCommit';

const Ai = memo(() => {
  const [loadingInfo, setLoadingInfo] = useState<string>(' Generating...');
  const [message, setMessage] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const theme = useTheme();

  const handleGenerate = useCallback(() => {
    genAiCommit({ setLoading, setLoadingInfo, setMessage, setSummary });
  }, []);

  useEffect(() => {
    handleGenerate();
  }, []);

  return (
    <Panel
      footer={
        summary && (
          <Text color={theme.colorTextDescription}>
            <Text bold>{`👉 DIFF SUMMARY: `}</Text>
            {summary}
          </Text>
        )
      }
      reverse
      title={`🤯 AI Commit Generator`}
    >
      {!loading && message ? <Text>{message}</Text> : <Spinner label={loadingInfo} />}
    </Panel>
  );
});

export default Ai;
