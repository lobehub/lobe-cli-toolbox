import { Panel } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';

export default function StatusDemo() {
  return (
    <Box flexDirection="column">
      <Panel status="active" title="Active step">
        <Text>Working…</Text>
      </Panel>
      <Panel status="done" title="Done step">
        <Text>Saved</Text>
      </Panel>
      <Panel status="warning" title="Warning step">
        <Text>Check the remote</Text>
      </Panel>
      <Panel status="error" title="Error step">
        <Text>Something failed</Text>
      </Panel>
    </Box>
  );
}
