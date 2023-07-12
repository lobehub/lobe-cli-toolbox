import { Panel, SelectInput, type SelectInputProps } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { memo, useCallback } from 'react';
import { shallow } from 'zustand/shallow';

import { useCommitStore } from '@/store/commitStore';

import Header from './Header';

const items: SelectInputProps['items'] = [
  {
    label: 'Only link issues',
    value: '',
  },
  {
    label: 'close #X',
    value: 'close',
  },
  {
    label: 'fix #X',
    value: 'fix',
  },
  {
    label: 'resolve #X',
    value: 'resolve',
  },
];

const InputIssues = memo(() => {
  const { message, setIssuesType, setStep } = useCommitStore(
    (st) => ({
      message: st.message,
      setIssuesType: st.setIssuesType,
      setStep: st.setStep,
    }),
    shallow,
  );
  useInput(useCallback((_, key) => key.tab && setStep('issues'), []));

  return (
    <Panel
      footer={<Text>{message}</Text>}
      header={<Header step={4} steps={4} title="Link issues (optional)" />}
    >
      <SelectInput
        items={items}
        onHighlight={(item) => setIssuesType(item.value as any)}
        onSelect={() => setStep('commit')}
      />
    </Panel>
  );
});

export default InputIssues;
