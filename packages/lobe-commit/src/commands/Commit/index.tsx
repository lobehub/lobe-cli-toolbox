import { Intro, Panel, StepSummary } from '@lobehub/cli-ui';
import { Box, Text, useApp } from 'ink';
import { memo, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { type Step, useCommitStore } from '@/store/commitStore';

import AiStep from './AiStep';
import IssuesStep from './IssuesStep';
import IssuesTypeStep from './IssuesTypeStep';
import ScopeStep from './ScopeStep';
import SubjectStep from './SubjectStep';
import TypeStep from './TypeStep';

const ORDER: Step[] = ['type', 'scope', 'subject', 'issues', 'issuesType'];

/** Finished steps of the manual flow, one line each. */
const Summary = memo<{ upTo: number }>(({ upTo }) => {
  const { emoji, issues, issuesType, scope, subject, type } = useCommitStore(
    (st) => ({
      emoji: st.emoji,
      issues: st.issues,
      issuesType: st.issuesType,
      scope: st.scope,
      subject: st.subject,
      type: st.type,
    }),
    shallow,
  );
  const issueList = issues
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((num) => `#${num.replace('#', '')}`)
    .join(', ');

  const rows = [
    { label: 'Type', value: `${emoji} ${type}` },
    { label: 'Scope', value: scope },
    { label: 'Subject', value: subject },
    { label: 'Issues', value: issueList && [issuesType, issueList].filter(Boolean).join(' ') },
  ].slice(0, upTo);

  return (
    <>
      {rows.map((row) => (
        <StepSummary key={row.label} label={row.label} value={row.value} />
      ))}
    </>
  );
});

interface Result {
  message?: string;
}

const Outro = memo<{ hook?: boolean; result: Result }>(({ hook, result }) => {
  if (!result.message) {
    return (
      <Panel footer={<Text dimColor>No commit was made</Text>} status="error" title="Cancelled" />
    );
  }
  const [header, ...rest] = result.message.split('\n');
  const body = rest.join('\n').trim();
  return (
    <Panel
      footer={<Text dimColor>{hook ? 'Message handed to git' : 'Running git commit'}</Text>}
      status="done"
      title={header}
    >
      {body ? <Text dimColor>{body}</Text> : undefined}
    </Panel>
  );
});

interface CommitProps {
  /** Running as a git hook: the message goes to git instead of `git commit`. */
  hook?: boolean;
}

/**
 * The interactive commit wizard. Exits the Ink app with the final message, or with nothing when
 * cancelled.
 */
const Commit = memo<CommitProps>(({ hook }) => {
  const { exit } = useApp();
  const step = useCommitStore((st) => st.step);
  const [result, setResult] = useState<Result>();

  useEffect(() => {
    void useCommitStore.getState().fetchIssuesList();
  }, []);

  useEffect(() => {
    if (result) exit(result.message);
  }, [result, exit]);

  const finish = (message = useCommitStore.getState().message) => setResult({ message });
  const cancel = () => setResult({});

  const renderStep = () => {
    switch (step) {
      case 'type': {
        return <TypeStep onCancel={cancel} />;
      }
      case 'scope': {
        return <ScopeStep />;
      }
      case 'subject': {
        return <SubjectStep />;
      }
      case 'issues': {
        return <IssuesStep onDone={() => finish()} />;
      }
      case 'issuesType': {
        return <IssuesTypeStep onDone={() => finish()} />;
      }
      case 'ai': {
        return <AiStep onCommit={finish} />;
      }
    }
  };

  const manualSteps = step === 'ai' ? 0 : ORDER.indexOf(step);

  return (
    <Box flexDirection="column">
      <Intro subtitle={hook ? 'git hook' : undefined} title="🤯 Lobe Commit" />
      {result ? (
        <Outro hook={hook} result={result} />
      ) : (
        <>
          <Summary upTo={Math.min(manualSteps, 4)} />
          {renderStep()}
        </>
      )}
    </Box>
  );
});

export default Commit;
