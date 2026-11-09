import { Panel } from '@lobehub/cli-ui';
import { Text } from 'ink';

export default function BasicDemo() {
  return (
    <Panel
      title="Commit type"
      hints={[
        ['enter', 'continue'],
        ['esc', 'back'],
      ]}
    >
      <Text>Pick a gitmoji type for this commit.</Text>
    </Panel>
  );
}
