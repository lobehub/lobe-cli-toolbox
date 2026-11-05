import { Panel, TextField } from '@lobehub/cli-ui';
import { memo } from 'react';

import { useCommitStore } from '@/store/commitStore';

import Preview from './Preview';

const SubjectStep = memo(() => {
  const subject = useCommitStore((st) => st.subject);
  const { back, setStep, setSubject } = useCommitStore.getState();

  return (
    <Panel
      title="Subject"
      hints={[
        ['enter', 'confirm'],
        ['esc', 'back'],
      ]}
    >
      <TextField
        defaultValue={subject}
        placeholder="Describe the change in a few words"
        validate={(value) => (value.trim() ? undefined : 'The subject can not be empty')}
        onCancel={back}
        onChange={setSubject}
        onSubmit={(value) => {
          setSubject(value.trim());
          setStep('issues');
        }}
      />
      <Preview />
    </Panel>
  );
});

export default SubjectStep;
