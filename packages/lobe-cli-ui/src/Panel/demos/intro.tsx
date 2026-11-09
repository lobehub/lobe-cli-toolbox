import { Intro, Panel, StepSummary } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';

export default function IntroDemo() {
  return (
    <Box flexDirection="column">
      <Intro subtitle="v2.0.0" title="🤯 Lobe Commit" />
      <StepSummary label="type" value="✨ feat" />
      <Panel
        title="Scope"
        hints={[
          ['enter', 'continue'],
          ['esc', 'back'],
        ]}
      >
        <Text>optional scope for this commit</Text>
      </Panel>
    </Box>
  );
}
