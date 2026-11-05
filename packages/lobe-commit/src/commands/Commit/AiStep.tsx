import { SelectInput, type SelectInputItem } from '@lobehub/cli-ui';
import { Box, useInput } from 'ink';
import { memo, useEffect } from 'react';

import AiPanel from '@/components/AiPanel';
import { useCommits } from '@/hooks/useCommits';
import { useCommitStore } from '@/store/commitStore';

interface AiStepProps {
  onCommit: (message: string) => void;
}

const AiStep = memo<AiStepProps>(({ onCommit }) => {
  const { loading, loadingInfo, message, restart, start, stop, summary, tokenUsage } = useCommits();

  useEffect(() => {
    start();
  }, [start]);

  useInput((_, key) => {
    if (!key.escape) return;
    stop();
    useCommitStore.getState().back();
  });

  const ready = !loading && !!message;

  const actions: SelectInputItem[] = [
    { hint: 'commit with this message', label: 'Commit', value: 'commit' },
    { hint: 'adjust type, scope and subject', label: 'Edit', value: 'edit' },
    { hint: 'from the full diff', label: 'Regenerate', value: 'reload' },
    ...(summary
      ? [{ hint: 'reuse the diff summary, faster', label: 'Retry message', value: 'retry' }]
      : []),
  ];

  const handleSelect = ({ value }: SelectInputItem) => {
    if (!message) return;
    switch (value) {
      case 'commit': {
        return onCommit(message);
      }
      case 'edit': {
        const { setMessage, setStep } = useCommitStore.getState();
        setMessage(message);
        return setStep('type');
      }
      case 'reload': {
        return restart();
      }
      case 'retry': {
        return start();
      }
    }
  };

  return (
    <AiPanel
      loading={loading}
      loadingInfo={loadingInfo}
      message={message}
      summary={summary}
      tokenUsage={tokenUsage}
      hints={
        ready
          ? [
              ['↑↓', 'move'],
              ['enter', 'select'],
              ['esc', 'back'],
            ]
          : [['esc', 'cancel']]
      }
    >
      {ready && (
        <Box marginTop={1}>
          <SelectInput items={actions} labelWidth={16} onSelect={handleSelect} />
        </Box>
      )}
    </AiPanel>
  );
});

export default AiStep;
