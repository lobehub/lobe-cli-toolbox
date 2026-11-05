import { alert } from '@lobehub/cli-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Commits } from '@/core/Commits';
import { selectors } from '@/store';

export interface CommitConfig {
  setMessage?: (msg: string) => void;
}

/**
 * Generates a commit message on `start()`. A newer `start()`/`restart()`/`stop()` discards the
 * result of the run in flight.
 */
export const useCommits = ({ setMessage }: CommitConfig = {}) => {
  const commits = useRef<Commits | null>(null);
  const runId = useRef(0);
  const summaryRef = useRef('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState(' Generating...');
  const [message, setLocalMessage] = useState<string>();
  const [tokenUsage, setTokenUsage] = useState(0);

  useEffect(() => () => void runId.current++, []);

  const run = useCallback(
    async (cacheSummary: string) => {
      const id = ++runId.current;
      const isCurrent = () => id === runId.current;
      const { stream } = selectors.getCommitConfig();

      setLoading(true);
      setLocalMessage(undefined);
      setTokenUsage(0);

      try {
        commits.current ??= new Commits();
        const result = await commits.current.genCommit({
          cacheSummary,
          onStreamMessage: stream
            ? (text) => {
                if (!isCurrent()) return;
                setLoading(false);
                setLocalMessage(text);
                setMessage?.(text);
              }
            : undefined,
          onTokenUsage: (usage) => isCurrent() && setTokenUsage(usage),
          setLoadingInfo: (info) => isCurrent() && setLoadingInfo(info),
          setSummary: (text) => {
            summaryRef.current = text;
            if (isCurrent()) setSummary(text);
          },
        });
        if (!isCurrent()) return;
        setLocalMessage(result);
        setMessage?.(result);
      } catch (error) {
        if (isCurrent()) alert.error(String((error as Error)?.message ?? error), true);
      } finally {
        if (isCurrent()) setLoading(false);
      }
    },
    [setMessage],
  );

  const start = useCallback(() => void run(summaryRef.current), [run]);

  const restart = useCallback(() => {
    summaryRef.current = '';
    setSummary('');
    void run('');
  }, [run]);

  const stop = useCallback(() => {
    runId.current++;
    setLoading(false);
  }, []);

  return { loading, loadingInfo, message, restart, start, stop, summary, tokenUsage };
};
