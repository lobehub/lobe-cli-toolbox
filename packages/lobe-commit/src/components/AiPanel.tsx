import { Panel, type PanelProps, symbols } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo, type ReactNode } from 'react';

import { selectors } from '@/store';

import AiMessageDisplay from './AiMessageDisplay';

const SUMMARY_LINES = 3;

const DiffSummary = memo<{ text: string }>(({ text }) => {
  const lines = text.split('\n').filter((line) => line.trim());
  const hidden = lines.length - SUMMARY_LINES;
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text dimColor>diff summary</Text>
      {lines.slice(0, SUMMARY_LINES).map((line, index) => (
        <Text dimColor key={index} wrap="truncate-end">
          {line}
        </Text>
      ))}
      {hidden > 0 && <Text dimColor>{`${symbols.ellipsis} ${hidden} more lines`}</Text>}
    </Box>
  );
});

interface AiPanelProps extends Pick<PanelProps, 'hints' | 'status'> {
  children?: ReactNode;
  loading: boolean;
  loadingInfo: string;
  message?: string;
  summary?: string;
  tokenUsage: number;
}

/** The AI generation: model and token usage, the diff summary and the (streaming) message. */
const AiPanel = memo<AiPanelProps>(
  ({ children, hints, loading, loadingInfo, message, status, summary, tokenUsage }) => {
    const { model } = selectors.getProviderConfig();
    const meta = [model, tokenUsage > 0 && `${tokenUsage.toLocaleString('en-US')} tokens`]
      .filter(Boolean)
      .join(` ${symbols.separator} `);

    return (
      <Panel hints={hints} status={status} subtitle={meta} title="AI commit message">
        {summary && <DiffSummary text={summary} />}
        <AiMessageDisplay loading={loading} loadingInfo={loadingInfo} message={message} />
        {children}
      </Panel>
    );
  },
);

export default AiPanel;
