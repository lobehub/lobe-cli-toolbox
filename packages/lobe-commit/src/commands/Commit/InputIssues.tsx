import { MultiSelect, type MultiSelectProps, Spinner, TextInput } from '@inkjs/ui';
import { Panel, SplitView, useTheme } from '@lobehub/cli-ui';
import isEqual from 'fast-deep-equal';
import { Text, useInput } from 'ink';
import { debounce } from 'lodash-es';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { useCommitStore } from '@/store/commitStore';

import Header from './Header';

const InputIssues = memo(() => {
  const { message, setIssues, setStep, issues, fetchIssuesList, isGithubRepo, issuesLoading } =
    useCommitStore(
      (st) => ({
        fetchIssuesList: st.fetchIssuesList,
        isGithubRepo: st.isGithubRepo,
        issues: st.issues,
        issuesLoading: st.issuesLoading,
        message: st.message,
        refreshMessage: st.refreshMessage,
        setIssues: st.setIssues,
        setStep: st.setStep,
      }),
      shallow,
    );
  const issueList = useCommitStore((st) => st.issueList, isEqual);
  useInput(useCallback((_, key) => key.tab && setStep('subject'), []));
  const [keywords, setKeywords] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    fetchIssuesList();
  }, []);

  const options: MultiSelectProps['options'] = useMemo(() => {
    let localIssueList = issueList;
    if (keywords) {
      localIssueList = localIssueList.filter(
        (item: any) =>
          item.title.toLowerCase().includes(keywords) || String(item.number).includes(keywords),
      );
    }
    return localIssueList.map((item: any) => ({
      label: (
        <>
          <Text
            backgroundColor={theme.colorBgLayout}
            color={theme.colorText}
          >{` #${item.number} `}</Text>
          {` ${item.title}`}
        </>
      ),
      value: String(item.number),
    })) as any;
  }, [keywords, issueList]);

  const handleKeywords = useCallback((v: string) => {
    setKeywords(v.replaceAll(' ', ''));
  }, []);

  const handleSelect = useCallback((v: string[]) => {
    setIssues(v.join(','));
    setKeywords('');
  }, []);

  const InputKeywords = useCallback(
    () => (
      <TextInput
        defaultValue={keywords}
        onChange={debounce(handleKeywords, 100)}
        placeholder="Input to keywords to filter issues, press [Space] to multi-select..."
      />
    ),
    [issues],
  );

  const handleSubmit = useCallback(() => {
    setStep(issues ? 'issuesType' : 'commit');
  }, [issues]);

  return (
    <Panel
      footer={<Text>{message}</Text>}
      header={<Header step={4} steps={4} title="Link issues (optional)" />}
    >
      {isGithubRepo ? (
        issuesLoading ? (
          <Spinner label=" Loading issues..." />
        ) : (
          <>
            <InputKeywords />
            <SplitView>
              <MultiSelect
                defaultValue={issues.split(',')}
                onChange={handleSelect}
                onSubmit={handleSubmit}
                options={options}
              />
              {options.length === 0 && (
                <Text color={theme.colorWarning}>No issues found, press [Enter] to skip...</Text>
              )}
            </SplitView>
          </>
        )
      ) : (
        <TextInput
          defaultValue={issues}
          onChange={debounce(setIssues, 100)}
          onSubmit={handleSubmit}
          placeholder="Input number to link issues, press [Enter] to confirm or skip..."
        />
      )}
    </Panel>
  );
});

export default InputIssues;
