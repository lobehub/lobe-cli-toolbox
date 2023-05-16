import { Alert, Spinner } from '@inkjs/ui';
import { execa } from 'execa';
import React, { useEffect, useState } from 'react';
interface RunGitCommitProps {
  message: string;
}
const RunGitCommit: React.FC<RunGitCommitProps> = ({ message }) => {
  const [loading, setLoading] = useState(true);
  try {
    useEffect(() => {
      execa('git', ['commit', '-m', message], {
        buffer: false,
        stdio: 'inherit',
      }).then(() => setLoading(false));
    }, []);
    if (loading) return <Spinner label=" Committing..." />;
    return <Alert variant="success">{` Successfully committed!`}</Alert>;
  } catch (e) {
    return <Alert variant="error">{` ${error.message}`}</Alert>;
  }
};

export default React.memo(RunGitCommit);
