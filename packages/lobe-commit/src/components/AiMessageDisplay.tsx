import { Spinner, useTheme } from '@lobehub/cli-ui';
import { Box, Text, useAnimation } from 'ink';
import { memo } from 'react';

interface AiMessageDisplayProps {
  loading: boolean;
  loadingInfo: string;
  message?: string;
}

const Cursor = memo(() => {
  const theme = useTheme();
  const { frame } = useAnimation({ interval: 500 });
  return <Text color={theme.colorPrimary}>{frame % 2 === 0 ? '▍' : ' '}</Text>;
});

/** Spinner until text arrives, then the (streaming) message with the header in bold. */
const AiMessageDisplay = memo<AiMessageDisplayProps>(({ loading, loadingInfo, message }) => {
  if (!message) return <Spinner label={loadingInfo} />;

  const [header, ...rest] = message.split('\n');
  const body = rest.join('\n').trim();

  return (
    <Box flexDirection="column">
      <Text>
        <Text bold>{header}</Text>
        {loading && !body && <Cursor />}
      </Text>
      {body && (
        <Box marginTop={1}>
          <Text>
            {body}
            {loading && <Cursor />}
          </Text>
        </Box>
      )}
    </Box>
  );
});

export default AiMessageDisplay;
