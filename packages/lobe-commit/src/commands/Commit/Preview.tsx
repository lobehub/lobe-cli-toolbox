import { useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo } from 'react';

import { useCommitStore } from '@/store/commitStore';

const MAX_HEADER = 72;

/** The commit header as it would be written, with a warning when it gets long. */
const Preview = memo(() => {
  const theme = useTheme();
  const message = useCommitStore((st) => st.message);
  const type = useCommitStore((st) => st.type);
  if (!type) return null;

  const header = message.split('\n')[0] ?? '';
  return (
    <Box marginTop={1}>
      <Box flexShrink={0} width={9}>
        <Text dimColor>preview</Text>
      </Box>
      <Text wrap="truncate-end">
        {header}
        {header.length > MAX_HEADER && (
          <Text color={theme.colorWarning}>{`  ${header.length}/${MAX_HEADER} chars`}</Text>
        )}
      </Text>
    </Box>
  );
});

export default Preview;
