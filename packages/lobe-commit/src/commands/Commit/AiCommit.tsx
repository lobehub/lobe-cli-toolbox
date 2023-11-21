import { Spinner } from '@inkjs/ui';
import { Panel, SelectInput, type SelectInputItem, SplitView, useTheme } from '@lobehub/cli-ui';
import { Text, useInput } from 'ink';
import { memo, useCallback, useEffect, useMemo } from 'react';

import { useCommits } from '@/hooks/useCommits';
import { useCommitStore } from '@/store/commitStore';

const AiCommit = memo(() => {
  const { message, setMessage, setStep } = useCommitStore((st) => ({
    message: st.message,
    setMessage: st.setMessage,
    setStep: st.setStep,
  }));
  useInput(useCallback((_, key) => key.tab && setStep('type'), []));
  const theme = useTheme();

  const { summary, start, loadingInfo, loading, restart } = useCommits({ setMessage });

  const handleSelect = useCallback(
    (item: any) => {
      switch (item.value) {
        case 'reloadFromSummary': {
          start();
          break;
        }
        case 'reload': {
          restart();
          break;
        }
        case 'edit': {
          setStep('type');
          break;
        }
        case 'confirm': {
          setStep('commit');
          break;
        }
      }
    },
    [start, restart],
  );

  useEffect(() => {
    start();
  }, [start]);

  const items = useMemo(
    () =>
      [
        summary && {
          label: '🔄️ Regenerate commit message from summary [FAST]',
          value: 'reloadFromSummary',
        },
        { label: '🔄️ Regenerate full commit message [SLOW]', value: 'reload' },
        { label: '✏️  Edit this message', value: 'edit' },
        { label: '✅  Use this message', value: 'confirm' },
      ].filter(Boolean) as SelectInputItem[],
    [summary],
  );

  return (
    <Panel
      footer={!loading && message && <SelectInput items={items} onSelect={handleSelect} />}
      title={`🤯 AI Commit Generator`}
    >
      {summary && (
        <SplitView direction={'bottom'}>
          <Text color={theme.colorTextDescription}>
            <Text bold>{`👉 DIFF SUMMARY: `}</Text>
            {summary}
          </Text>
        </SplitView>
      )}
      {!loading && message ? <Text>{message}</Text> : <Spinner label={loadingInfo} />}
    </Panel>
  );
});

export default AiCommit;
