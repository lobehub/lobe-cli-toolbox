import { Alert, Spinner } from '@inkjs/ui';
import { execaSync } from 'execa';
import fs from 'node:fs';
import { memo, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { useCommitStore } from '@/store/commitStore';

interface RunGitCommitProps {
  hook?: boolean | string;
}
const RunGitCommit = memo<RunGitCommitProps>(({ hook }) => {
  const { message } = useCommitStore(
    (st) => ({
      message: st.message,
    }),
    shallow,
  );
  const [loading, setLoading] = useState<boolean>(true);
  try {
    useEffect(() => {
      if (hook) {
        const commitMsgFile = typeof hook === 'string' ? hook : process.argv[3];
        if (commitMsgFile) {
          fs.writeFileSync(commitMsgFile, message);
        }
        setLoading(false);
      } else {
        execaSync('git', ['commit', '-m', message], {
          buffer: false,
          stdio: 'inherit',
        });
        setLoading(false);
      }
    }, []);
    if (loading) return <Spinner label=" Committing..." />;
    return <Alert variant="success">{` Successfully committed!`}</Alert>;
  } catch (error: any) {
    return <Alert variant="error">{` ${error.message}`}</Alert>;
  }
});

export default RunGitCommit;
