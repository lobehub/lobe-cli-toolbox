import { Panel, SelectInput, type SelectInputItem } from '@lobehub/cli-ui';
import { useInput } from 'ink';
import { memo, useMemo } from 'react';

import { useCommitStore } from '@/store/commitStore';
import type { IssuesType } from '@/utils/genCommitMessage';

import Preview from './Preview';

const TYPES: { label: string; value: IssuesType }[] = [
  { label: 'Reference', value: '' },
  { label: 'Close', value: 'close' },
  { label: 'Fix', value: 'fix' },
  { label: 'Resolve', value: 'resolve' },
];

interface IssuesTypeStepProps {
  onDone: () => void;
}

const IssuesTypeStep = memo<IssuesTypeStepProps>(({ onDone }) => {
  const issues = useCommitStore((st) => st.issues);
  const issuesType = useCommitStore((st) => st.issuesType);
  const { back, setIssuesType } = useCommitStore.getState();

  useInput((_, key) => key.escape && back());

  const items: SelectInputItem[] = useMemo(() => {
    const numbers = issues.split(/[\s,]+/).filter(Boolean);
    return TYPES.map(({ label, value }) => ({
      hint: numbers.map((num) => `${value ? `${value} ` : ''}#${num.replace('#', '')}`).join(', '),
      label,
      value,
    }));
  }, [issues]);

  return (
    <Panel
      title="How do these issues relate?"
      hints={[
        ['↑↓', 'move'],
        ['enter', 'confirm'],
        ['esc', 'back'],
      ]}
    >
      <SelectInput
        initialValue={issuesType}
        items={items}
        labelWidth={12}
        onHighlight={(item) => setIssuesType(item.value as IssuesType)}
        onSelect={onDone}
      />
      <Preview />
    </Panel>
  );
});

export default IssuesTypeStep;
