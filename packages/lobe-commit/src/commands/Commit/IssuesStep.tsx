import {
  MultiSearchSelect,
  multiSearchSelectHints,
  Panel,
  Spinner,
  symbols,
  TextField,
} from '@lobehub/cli-ui';
import { Box, Text, useInput } from 'ink';
import { memo, useMemo } from 'react';

import { useCommitStore } from '@/store/commitStore';

import Preview from './Preview';

const ISSUE_INPUT = /^[\s#,\d]*$/;

interface IssuesStepProps {
  onDone: () => void;
}

const IssuesStep = memo<IssuesStepProps>(({ onDone }) => {
  const status = useCommitStore((st) => st.issuesStatus);
  const error = useCommitStore((st) => st.issuesError);
  const issueList = useCommitStore((st) => st.issueList);
  const issues = useCommitStore((st) => st.issues);
  const { back, setIssues, setStep } = useCommitStore.getState();

  const submit = (value: string) => {
    setIssues(value);
    if (value.trim()) setStep('issuesType');
    else onDone();
  };

  useInput(
    (_, key) => {
      if (key.escape) back();
      else if (key.return) submit(issues);
    },
    { isActive: status === 'loading' || status === 'idle' },
  );

  const items = useMemo(
    () =>
      issueList.map((issue) => ({
        hint: issue.title,
        keywords: [issue.user?.login ?? ''],
        label: `#${issue.number}`,
        value: String(issue.number),
      })),
    [issueList],
  );
  const labelWidth = Math.max(0, ...items.map((item) => item.label.length)) + 2;

  if (status === 'ready') {
    return (
      <Panel hints={multiSearchSelectHints} subtitle="optional" title="Link issues">
        <MultiSearchSelect
          defaultValue={issues.split(',')}
          emptyText="No matching issue"
          items={items}
          labelWidth={labelWidth}
          placeholder={`Search ${items.length} open issues`}
          onCancel={back}
          onChange={(values) => setIssues(values.join(','))}
          onSubmit={(values) => submit(values.join(','))}
        />
        <Preview />
      </Panel>
    );
  }

  if (status === 'unavailable') {
    return (
      <Panel
        subtitle="optional"
        title="Link issues"
        hints={[
          ['enter', 'confirm or skip'],
          ['esc', 'back'],
        ]}
      >
        <TextField
          defaultValue={issues}
          placeholder="Issue numbers, e.g. 12, 34"
          validate={(value) =>
            ISSUE_INPUT.test(value) ? undefined : 'Use issue numbers like 12, 34'
          }
          onCancel={back}
          onChange={setIssues}
          onSubmit={submit}
        />
        {error && (
          <Box marginTop={1}>
            <Text dimColor>{`${symbols.info} ${error}`}</Text>
          </Box>
        )}
        <Preview />
      </Panel>
    );
  }

  return (
    <Panel
      subtitle="optional"
      title="Link issues"
      hints={[
        ['enter', 'skip'],
        ['esc', 'back'],
      ]}
    >
      <Spinner label="Loading open issues" />
      <Preview />
    </Panel>
  );
});

export default IssuesStep;
