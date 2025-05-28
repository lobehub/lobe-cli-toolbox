import { alert } from '@lobehub/cli-ui';
import { useCallback, useRef, useState } from 'react';
import useSWR, { type SWRConfiguration } from 'swr';

import { Commits } from '@/core/Commits';
import { selectors } from '@/store';

export interface CommitConfig extends SWRConfiguration {
  setMessage?: (msg: string) => void;
}
export const useCommits = ({ setMessage, onSuccess, onError, ...config }: CommitConfig = {}) => {
  const commits = useRef(new Commits());
  const [summary, setSummary] = useState<string>('');
  const [loadingInfo, setLoadingInfo] = useState<string>(' Generating...');
  const [shouldFetch, setShouldFetch] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(true);
  const [key, setKey] = useState<string>(Date.now().toString());
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const commitConfig = selectors.getCommitConfig();

  const handleStreamMessage = useCallback(
    (message: string) => {
      setStreamingMessage(message);
      setMessage?.(message);
    },
    [setMessage],
  );

  const { data, isLoading } = useSWR(
    shouldFetch ? key : null,
    async () =>
      commits.current.genCommit({
        cacheSummary: summary,
        onStreamMessage: commitConfig.stream ? handleStreamMessage : undefined,
        setLoadingInfo,
        setSummary,
      }),
    {
      onError: (err, ...rest) => {
        onError?.(err, ...rest);
        alert.error(err, true);
      },
      onErrorRetry: () => false,
      onSuccess: (data, ...rest) => {
        setShouldFetch(false);
        if (data && !commitConfig.stream) setMessage?.(data);
        onSuccess?.(data, ...rest);
        setIsGlobalLoading(false);
      },
      ...config,
    },
  );

  const start = useCallback(() => {
    setKey(Date.now().toString());
    setIsGlobalLoading(true);
    setStreamingMessage('');
    setShouldFetch(true);
  }, []);

  const restart = useCallback(() => {
    setSummary('');
    setKey(Date.now().toString());
    setIsGlobalLoading(true);
    setStreamingMessage('');
    setShouldFetch(true);
  }, []);

  const stop = useCallback(() => {
    setIsGlobalLoading(false);
    setShouldFetch(false);
  }, []);

  return {
    loading: isLoading || isGlobalLoading,
    loadingInfo: loadingInfo,
    message: commitConfig.stream ? streamingMessage : data,
    restart,
    start,
    stop,
    summary,
  };
};
