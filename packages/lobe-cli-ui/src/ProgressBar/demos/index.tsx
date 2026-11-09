import { ProgressBar } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { useEffect, useState } from 'react';

export default function BasicDemo() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setValue((v) => (v >= 100 ? 0 : v + 5));
    }, 120);
    return () => clearInterval(id);
  }, []);
  return (
    <Box>
      <ProgressBar value={value} width={24} />
      <Text> {value}%</Text>
    </Box>
  );
}
