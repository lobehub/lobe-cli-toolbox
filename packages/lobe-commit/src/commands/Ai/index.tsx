import { Spinner } from '@inkjs/ui';
import { Panel, useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import { useCommits } from '@/hooks/useCommits';

const Ai = memo(() => {
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();

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
      title={`🤯 AI Commit Generator`}
    >
      {!loading && message ? <Text>{message}</Text> : <Spinner label={loadingInfo} />}
    </Panel>
  );
});

export default Ai;
