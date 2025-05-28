import { Spinner } from '@inkjs/ui';
import { Panel, useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import { useCommits } from '@/hooks/useCommits';
import { selectors } from '@/store';

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

const Ai = memo(() => {
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();
  const commitConfig = selectors.getCommitConfig();

  const { summary, start, loadingInfo, loading } = useCommits({ setMessage });

  useEffect(() => {
    start();
  }, [start]);

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
      title={`🤯 AI Commit Generator ${commitConfig.stream ? '(Streaming)' : ''}`}
    >
      {!loading && message ? (
        <Text>{message}</Text>
      ) : loading && message && commitConfig.stream ? (
        <Text>
          {message}
          <StreamingCursor />
        </Text>
      ) : (
        <Spinner label={loadingInfo} />
      )}
    </Panel>
  );
});

export default Ai;
