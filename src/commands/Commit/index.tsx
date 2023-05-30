import { Alert, TextInput } from '@inkjs/ui';
import fs from 'fs';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { debounce } from 'lodash-es';
import { memo, useMemo, useState } from 'react';

import { BorderView, Tabs, View } from '../../components';
import configStore, { CONFIG_NAME } from '../../constants/config';
import gitmojis from '../../constants/gitmojis';
import genCommitMessage from '../../utils/genCommitMessage';
import getAbsoluteHooksPath from '../../utils/getAbsoluteHooksPath';
import { HOOK } from '../Hook/HookCreate';
import AiCommit from './AiCommit';
import IssuesList from './IssuesList';
import RunGitCommit from './RunGitCommit';
import StepHeader from './StepHeader';

interface CommitProps {
  hook?: boolean;
}

const Commit = memo<CommitProps>(({ hook }) => {
  const [step, setStep] = useState<number>(0);
  const [typeKeywords, setTpeKeywords] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [scope, setScope] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [issues, setIssues] = useState<string>('');

  const emojiFormatConfig = configStore.get(CONFIG_NAME.EMOJI_FORMAT);

  const commitMessage = genCommitMessage({ type, scope, subject, issues });
  const handleSelect = (item: any) => {
    if (!item) return;
    if (item.value === 'ai') {
      setStep(100);
    } else {
      setType(item.value);
      setStep(1);
    }
  };

  const types: any[] = useMemo(() => {
    let data = gitmojis;
    if (typeKeywords) {
      data = data.filter((item) => item.type.includes(typeKeywords));
    }
    let selection = data.map((item) => ({
      label: (
        <>
          <Text backgroundColor="#000" color="#fff">
            {` ${item.emoji} ${item.type} `}
          </Text>
          <Text color="#999">{` - ${item.descEN}`}</Text>
        </>
      ),
      value: `${emojiFormatConfig ? item.emoji : item.code} ${item.type}`,
    }));

    selection = [
      ...selection,
      {
        label: (
          <>
            <Text backgroundColor="#000" color="#fff">
              {' 🤯 Use AI Commit '}
            </Text>
            <Text color="#999">{` - generate commit message by ChatGPT`}</Text>
          </>
        ),
        value: 'ai',
      },
    ];
    return selection;
  }, [typeKeywords]);

  const steps: any = [
    {
      key: 0,
      title: 'Select commit type',
      children: (
        <View>
          <SelectInput items={types} onSelect={debounce(handleSelect, 100)} />
        </View>
      ),
    },
    {
      key: 1,
      title: 'Input commit scope (optional)',
      children: (
        <View>
          <Box>
            <Text color="blue">❯ </Text>
            <TextInput
              onChange={debounce(setScope, 100)}
              onSubmit={() => setStep(2)}
              placeholder="Input commit <scope>, or press [Enter] to skip..."
            />
          </Box>
        </View>
      ),
    },
    {
      key: 2,
      title: 'Input commit subject',
      children: (
        <View>
          <Box>
            <Text color="blue">❯ </Text>
            <TextInput
              onChange={debounce(setSubject, 100)}
              onSubmit={() => subject && setStep(3)}
              placeholder="Input commit <subject>..."
            />
          </Box>
        </View>
      ),
    },
    {
      key: 3,
      title: 'Link issues (optional)',
      children: <IssuesList onChange={debounce(setIssues, 100)} onSubmit={() => setStep(4)} />,
    },
  ];

  const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);

  if (!hook && fs.existsSync(hookFile)) {
    return (
      <Alert variant="warning">{`Lobe Commit is in hook mode, use "git commit" instead.`}</Alert>
    );
  }

  if (step === 100) return <AiCommit hook={hook} />;
  if (step === 4) return <RunGitCommit hook={hook} message={commitMessage} />;

  return (
    <>
      <StepHeader step={step} steps={steps} />
      <BorderView>
        <Box>
          {step === 0 ? (
            <TextInput
              onChange={debounce(setTpeKeywords, 100)}
              placeholder="Search commit <type>..."
            />
          ) : (
            <Text>{commitMessage}</Text>
          )}
        </Box>
        <Tabs activeKey={step} items={steps} />
      </BorderView>
    </>
  );
});

export default Commit;
