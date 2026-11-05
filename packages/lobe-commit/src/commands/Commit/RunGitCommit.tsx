import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

import { Alert, Spinner } from '@lobehub/cli-ui';
import { memo, useEffect, useState } from 'react';

import { useCommitStore } from '@/store/commitStore';

interface RunGitCommitProps {
  hook?: boolean | string;
}

type Status = { type: 'loading' } | { type: 'success' } | { message: string; type: 'error' };

const RunGitCommit = memo<RunGitCommitProps>(({ hook }) => {
  const message = useCommitStore((st) => st.message);
  const [status, setStatus] = useState<Status>({ type: 'loading' });

  useEffect(() => {
    try {
      if (hook) {
        // As a `prepare-commit-msg` hook, git passes the message file as the first argument.
        const commitMsgFile = typeof hook === 'string' ? hook : process.argv[3];
        if (commitMsgFile) writeFileSync(commitMsgFile, message);
      } else {
        execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' });
      }
      setStatus({ type: 'success' });
    } catch (error) {
      setStatus({ message: (error as Error).message, type: 'error' });
      process.exitCode = 1;
    }
  }, []);

  if (status.type === 'loading') return <Spinner label=" Committing..." />;
  if (status.type === 'error') return <Alert variant="error">{` ${status.message}`}</Alert>;
  return <Alert variant="success">{` Successfully committed!`}</Alert>;
});

export default RunGitCommit;
