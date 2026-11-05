import { Panel, useTheme } from '@lobehub/cli-ui';
import { Text } from 'ink';
import { memo, useEffect, useState } from 'react';

import AiMessageDisplay from '@/components/AiMessageDisplay';
import { useCommits } from '@/hooks/useCommits';
import { selectors } from '@/store';

const Ai = memo(() => {
  const [message, setMessage] = useState<string>('');
  const theme = useTheme();
  const commitConfig = selectors.getCommitConfig();

  const {
    summary,
    start,
    loadingInfo,
    loading,
    tokenUsage,
    message: streamingMessage,
  } = useCommits({ setMessage });

  useEffect(() => {
    start();
  }, [start]);

  return (
    <Panel
      reverse
      title={`🤯 AI Commit Generator ${commitConfig.stream ? '(Streaming)' : ''} ${tokenUsage > 0 ? `[Tokens: ${tokenUsage}]` : ''}`}
      footer={
        summary && (
          <Text color={theme.colorTextDescription}>
            <Text bold>{`👉 DIFF SUMMARY: `}</Text>
            {summary}
          </Text>
        )
      }
    >
      <AiMessageDisplay
        loading={loading}
        loadingInfo={loadingInfo}
        message={message}
        streamingMessage={streamingMessage}
      />
    </Panel>
  );
});

export default Ai;
