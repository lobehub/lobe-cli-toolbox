import { alert } from '@lobehub/cli-ui';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Commits } from '@/core/Commits';
import { selectors } from '@/store';

/**
 * Generates a commit message on `start()`. `loading` stays true until the message is complete,
 * while `message` already holds the streamed text. A newer `start()`/`restart()`/`stop()`
 * discards the result of the run in flight.
 */
export const useCommits = () => {
  const commits = useRef<Commits | null>(null);
  const runId = useRef(0);
  const summaryRef = useRef('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInfo, setLoadingInfo] = useState('Generating commit message');
  const [message, setMessage] = useState<string>();
  const [tokenUsage, setTokenUsage] = useState(0);

  useEffect(() => () => void runId.current++, []);

  const run = useCallback(async (cacheSummary: string) => {
    const id = ++runId.current;
    const isCurrent = () => id === runId.current;
    const { stream } = selectors.getCommitConfig();

    setLoading(true);
    setMessage(undefined);
    setTokenUsage(0);

    try {
      commits.current ??= new Commits();
      const result = await commits.current.genCommit({
        cacheSummary,
        onStreamMessage: stream
          ? (text) => isCurrent() && setMessage(text || undefined)
          : undefined,
        onTokenUsage: (usage) => isCurrent() && setTokenUsage(usage),
        setLoadingInfo: (info) => isCurrent() && setLoadingInfo(info),
        setSummary: (text) => {
          summaryRef.current = text;
          if (isCurrent()) setSummary(text);
        },
      });
      if (isCurrent()) setMessage(result);
    } catch (error) {
      if (isCurrent()) alert.error(String((error as Error)?.message ?? error), true);
    } finally {
      if (isCurrent()) setLoading(false);
    }
  }, []);

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
