import { Alert, Spinner } from '@inkjs/ui';
import { execaSync } from 'execa';
import fs from 'fs';
import React, { useEffect, useState } from 'react';
interface RunGitCommitProps {
  message: string;
  hook?: boolean;
}
const RunGitCommit: React.FC<RunGitCommitProps> = ({ hook, message }) => {
  const [loading, setLoading] = useState<boolean>(true);
  try {
    useEffect(() => {
      if (hook) {
        // @ts-ignore
        fs.writeFileSync(process.argv[3], message);
        setLoading(false);
      } else {
        execaSync('git', ['add', '--all']);
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
};

export default React.memo(RunGitCommit);
