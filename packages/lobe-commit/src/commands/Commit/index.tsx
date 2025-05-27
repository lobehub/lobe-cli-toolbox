import { Alert } from '@inkjs/ui';
import fs from 'node:fs';
import * as process from 'node:process';
import { memo, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { HOOK } from '@/constants/hook';
import { useCommitStore } from '@/store/commitStore';
import getAbsoluteHooksPath, { ERROR_CODE } from '@/utils/getAbsoluteHooksPath';

import AiCommit from './AiCommit';
import InputIssues from './InputIssues';
import InputIssuesType from './InputIssuesType';
import InputScope from './InputScope';
import InputSubject from './InputSubject';
import InputType from './InputType';
import RunGitCommit from './RunGitCommit';

interface CommitProps {
  hook?: boolean | string;
}

const Commit = memo<CommitProps>(({ hook }) => {
  const [hasHook, setHasHook] = useState(false);
  const { step } = useCommitStore(
    (st) => ({
      step: st.step,
    }),
    shallow,
  );

  useEffect(() => {
    const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);
    if (hookFile === ERROR_CODE) process.exit(1);
    const hasHookFile = fs.existsSync(hookFile);
    if (hasHookFile) setHasHook(true);
  }, []);

  if (!hook && hasHook) {
    return (
      <Alert variant="warning">{`Lobe Commit is in hook mode, use "git commit" instead.`}</Alert>
    );
  }

  if (step === 'type') return <InputType />;
  if (step === 'scope') return <InputScope />;
  if (step === 'subject') return <InputSubject />;
  if (step === 'issues') return <InputIssues />;
  if (step === 'issuesType') return <InputIssuesType />;
  if (step === 'ai') return <AiCommit />;
  if (step === 'commit') return <RunGitCommit hook={hook} />;
  return;
});

export default Commit;
