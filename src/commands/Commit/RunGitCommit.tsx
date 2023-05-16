import { Alert, Spinner } from '@inkjs/ui';
import { execaSync } from 'execa';
import fs from 'fs';
import { useStdout } from 'ink';
import React, { useEffect, useState } from 'react';
interface RunGitCommitProps {
  message: string;
  hook?: boolean;
}
const RunGitCommit: React.FC<RunGitCommitProps> = ({ hook, message }) => {
  const { write } = useStdout();
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string>('');
  try {
    useEffect(() => {
      if (hook) {
        // @ts-ignore
        fs.writeFileSync(process.argv[3], message);
        setLoading(false);
      } else {
        const result = execaSync('git', ['commit', '-m', message], {
          buffer: false,
          stdio: 'inherit',
        });
        write(result.stdout);
        if (result.failed) setErr(result.stderr);
        setLoading(false);
      }
    }, []);
    if (loading) return <Spinner label=" Committing..." />;
    if (err) return <Alert variant="error">{` ${err}`}</Alert>;
    return <Alert variant="success">{` Successfully committed!`}</Alert>;
  } catch (e) {
    return <Alert variant="error">{` ${error.message}`}</Alert>;
  }
};

export default React.memo(RunGitCommit);
