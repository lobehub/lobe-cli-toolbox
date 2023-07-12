import { TextInput } from '@inkjs/ui';
import { Panel } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { debounce } from 'lodash-es';
import { memo, useCallback } from 'react';
import { shallow } from 'zustand/shallow';

import { useCommitStore } from '@/store/commitStore';

import Header from './Header';

const InputScope = memo(() => {
  const { message, setScope, setStep, scope } = useCommitStore(
    (st) => ({
      message: st.message,
      scope: st.scope,
      setScope: st.setScope,
      setStep: st.setStep,
    }),
    shallow,
  );
  useInput(useCallback((_, key) => key.tab && setStep('type'), []));

  return (
    <Panel
      footer={<Text>{message}</Text>}
      header={<Header step={2} steps={4} title="Input commit scope (optional)" />}
    >
      <TextInput
        defaultValue={scope}
        onChange={debounce(setScope, 100)}
        onSubmit={() => setStep('subject')}
        placeholder="Input commit <scope>, or press [Enter] to skip..."
      />
    </Panel>
  );
});

export default InputScope;
