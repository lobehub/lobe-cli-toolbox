import { Alert, Spinner } from '@inkjs/ui';
import { execa } from 'execa';
import fs from 'fs';
import React, { useEffect, useState } from 'react';
interface RunGitCommitProps {
  message: string;
  hook?: boolean;
}
const RunGitCommit: React.FC<RunGitCommitProps> = ({ hook, message }) => {
  const [loading, setLoading] = useState(true);
  try {
    useEffect(() => {
      if (hook) {
        fs.writeFileSync(process.argv[3], message);
        setLoading(false);
      } else {
        execa('git', ['commit', '-m', message], {
          buffer: false,
          stdio: 'inherit',
        }).then(() => setLoading(false));
      }
    }, []);
    if (loading) return <Spinner label=" Committing..." />;
    return <Alert variant="success">{` Successfully committed!`}</Alert>;
  } catch (e) {
    return <Alert variant="error">{` ${error.message}`}</Alert>;
  }
};

export default React.memo(RunGitCommit);
