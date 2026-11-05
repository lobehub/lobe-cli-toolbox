import { Intro } from '@lobehub/cli-ui';
import { Box, useApp } from 'ink';
import { memo, useEffect } from 'react';

import AiPanel from '@/components/AiPanel';
import { useCommits } from '@/hooks/useCommits';

/** Generates a message for the staged diff and prints it, without committing. */
const Ai = memo(() => {
  const { exit } = useApp();
  const { loading, loadingInfo, message, start, summary, tokenUsage } = useCommits();

  useEffect(() => {
    start();
  }, [start]);

  const done = !loading && !!message;

  useEffect(() => {
    if (done) exit();
  }, [done, exit]);

  return (
    <Box flexDirection="column">
      <Intro title="🤯 Lobe Commit" />
      <AiPanel
        loading={loading}
        loadingInfo={loadingInfo}
        message={message}
        status={done ? 'done' : 'active'}
        summary={summary}
        tokenUsage={tokenUsage}
      />
    </Box>
  );
});

export default Ai;
