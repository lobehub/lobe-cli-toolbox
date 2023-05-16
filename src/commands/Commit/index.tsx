import { TextInput } from '@inkjs/ui';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useMemo, useState } from 'react';
import { Tabs } from '../../components';
import configStore from '../../constants/config.js';
import gitmojis from '../../constants/gitmojis';
import genCommitMessage from '../../utils/genCommitMessage';
import IssuesList from './IssuesList';
import RunGitCommit from './RunGitCommit';
import StepHeader from './StepHeader';

interface CommitProps {
  hook?: boolean;
}

const Commit: React.FC<CommitProps> = ({ hook }) => {
  const [step, setStep] = useState<number>(0);
  const [typeKeywords, setTpeKeywords] = useState<string>('');
  const [type, setType] = useState<string>('');
  const [scope, setScope] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [issues, setIssues] = useState<string>('');

  const emojiFormatConfig = configStore.get('emojiFormat');

  const commitMessage = genCommitMessage({ type, scope, subject, issues });
  const handleSelect = (item: any) => {
    if (!item) return;
    setType(item.value);
    setStep(1);
  };

  const types: any[] = useMemo(() => {
    let data = gitmojis;
    if (typeKeywords) {
      data = data.filter((item) => item.type.includes(typeKeywords));
    }
    return data.map((item) => ({
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
  }, [typeKeywords]);

  const steps: any = [
    {
      key: 0,
      title: 'Select commit type',
      children: <SelectInput items={types} onSelect={handleSelect} />,
    },
    {
      key: 1,
      title: 'Input commit scope (optional)',
      children: (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input commit <scope>..."
            onChange={setScope}
            onSubmit={() => setStep(2)}
          />
        </Box>
      ),
    },
    {
      key: 2,
      title: 'Input commit subject',
      children: (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input commit <subject>..."
            onChange={setSubject}
            onSubmit={() => subject && setStep(3)}
          />
        </Box>
      ),
    },
    {
      key: 3,
      title: 'Link issues (optional)',
      children: <IssuesList onChange={setIssues} onSubmit={() => setStep(4)} />,
    },
  ];

  if (step === 4) return <RunGitCommit hook={hook} message={commitMessage} />;

  return (
    <>
      <StepHeader step={step} steps={steps} />
      <Tabs items={steps} activeKey={step} />
      <Box borderStyle="round" borderColor="#333">
        <Text> </Text>
        {step === 0 ? (
          <TextInput placeholder="Search commit <type>..." onChange={setTpeKeywords} />
        ) : (
          <Text>{commitMessage}</Text>
        )}
      </Box>
    </>
  );
};

export default React.memo(Commit);
