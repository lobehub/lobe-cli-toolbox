import { Panel, TextInput } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { debounce } from 'lodash-es';
import { memo, useCallback, useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { useCommitStore } from '@/store/commitStore';

import Header from './Header';

const InputScope = memo(() => {
  const { message, setSubject, setStep, subject, shouldSkipIssues, fetchIssuesList } =
    useCommitStore(
      (st) => ({
        fetchIssuesList: st.fetchIssuesList,
        message: st.message,
        setStep: st.setStep,
        setSubject: st.setSubject,
        shouldSkipIssues: st.shouldSkipIssues,
        subject: st.subject,
      }),
      shallow,
    );

  useInput(useCallback((_, key) => key.tab && setStep('scope'), []));

  // 预先获取 issues 信息来判断是否需要跳过
  useEffect(() => {
    fetchIssuesList();
  }, [fetchIssuesList]);

  const handleSubmit = useCallback(() => {
    if (subject) {
      if (shouldSkipIssues) {
        setStep('commit');
      } else {
        setStep('issues');
      }
    }
  }, [subject, shouldSkipIssues, setStep]);

  return (
    <Panel
      footer={<Text>{message}</Text>}
      header={<Header step={3} steps={4} title="Input commit subject" />}
    >
      <TextInput
        defaultValue={subject}
        onChange={debounce(setSubject, 100)}
        onSubmit={handleSubmit}
        placeholder="Input commit <subject>..."
      />
    </Panel>
  );
});

export default InputScope;
