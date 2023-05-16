import { TextInput } from '@inkjs/ui';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useMemo, useState } from 'react';
import gitmojis from '../../constants/gitmojis';
import Header from './Header';
import RunGitCommit from './RunGitCommit';
import { genMessage } from './utlis';

const steps: any = [
  { step: 0, title: 'Select commit type' },
  { step: 1, title: 'Input commit scope (optional)' },
  { step: 2, title: 'Input commit subject' },
  { step: 3, title: 'Link issues (optional)' },
];

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
  const handleSelect = (item: any) => {
    if (!item) return;
    setType(item.value);
    setStep(1);
  };

  const types = useMemo(() => {
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
      value: `${item.emoji} ${item.type}`,
    }));
  }, [typeKeywords]);

  if (step === 4)
    return <RunGitCommit hook={hook} message={genMessage({ type, scope, subject, issues })} />;

  return (
    <>
      <Header step={step} steps={steps} />
      {step === 0 && (
        <>
          <SelectInput items={types} onSelect={handleSelect} />
        </>
      )}
      {step === 1 && (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input commit <scope>..."
            onChange={setScope}
            onSubmit={() => setStep(2)}
          />
        </Box>
      )}
      {step === 2 && (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input commit <subject>..."
            onChange={setSubject}
            onSubmit={() => setStep(3)}
          />
        </Box>
      )}
      {step === 3 && (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input linked <issues>..."
            onChange={setIssues}
            onSubmit={() => setStep(4)}
          />
        </Box>
      )}
      <Box borderStyle="round" borderColor="#333">
        <Text> </Text>
        {step === 0 ? (
          <TextInput placeholder="Search commit <type>..." onChange={setTpeKeywords} />
        ) : (
          <Text>{genMessage({ type, scope, subject, issues })}</Text>
        )}
      </Box>
    </>
  );
};

export default React.memo(Commit);
