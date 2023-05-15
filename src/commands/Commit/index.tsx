import { TextInput } from '@inkjs/ui';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import React, { useState } from 'react';
import gitmojis from '../../constants/gitmojis';

const steps: any = [
  { step: 0, title: 'Select the commit type' },
  { step: 1, title: 'Input scope prompt' },
  { step: 2, title: 'Input commit message' },
];

const genMessage = (type: string, scope: string, message: string): string => {
  let msg = type;
  if (scope) msg = `${msg}(${scope})`;
  msg = `${msg}: ${message}`;
  return msg;
};

const Commit: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [type, setType] = useState<string>('waiting for selection...');
  const [scope, setScope] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const handleSelect = (item: any) => {
    setType(item.value);
    setStep(1);
  };

  const types: any = gitmojis.map((item) => ({
    label: (
      <Text backgroundColor="#000" color="#fff">
        {` ${item.emoji} ${item.type} `}
      </Text>
    ),
    value: `${item.emoji} ${item.type}`,
  }));

  return (
    <>
      <Box justifyContent="center" borderStyle="round" borderColor="#333">
        <Text color="#000" backgroundColor="#fff">
          {` ${step + 1}/${steps.length} `}
        </Text>
        <Text> </Text>
        <Text>{steps[step].title}</Text>
      </Box>
      {step === 0 && <SelectInput items={types} onSelect={handleSelect} />}
      {step === 1 && (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput
            placeholder="Input scope prompt..."
            onChange={setScope}
            onSubmit={() => setStep(2)}
          />
        </Box>
      )}
      {step === 2 && (
        <Box>
          <Text color="blue">❯ </Text>
          <TextInput placeholder="Input commit message..." onChange={setMessage} />
        </Box>
      )}
      <Box borderStyle="round" borderColor="#333">
        <Text> </Text>
        <Text>{genMessage(type, scope, message)}</Text>
      </Box>
    </>
  );
};

export default Commit;
