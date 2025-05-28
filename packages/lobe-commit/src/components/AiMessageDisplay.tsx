import { Spinner } from '@inkjs/ui';
import { Text } from 'ink';
import { memo } from 'react';

import { selectors } from '@/store';

import StreamingCursor from './StreamingCursor';

interface AiMessageDisplayProps {
  loading: boolean;
  loadingInfo: string;
  message?: string;
  streamingMessage?: string;
}

const AiMessageDisplay = memo<AiMessageDisplayProps>(
  ({ loading, loadingInfo, message, streamingMessage }) => {
    const commitConfig = selectors.getCommitConfig();

    if (commitConfig.stream) {
      if (loading) {
        if (streamingMessage) {
          return (
            <Text>
              {streamingMessage}
              <StreamingCursor />
            </Text>
          );
        } else {
          return (
            <Text>
              <StreamingCursor />
            </Text>
          );
        }
      } else {
        return <Text>{message}</Text>;
      }
    } else {
      if (!loading && message) {
        return <Text>{message}</Text>;
      } else {
        return <Spinner label={loadingInfo} />;
      }
    }
  },
);

export default AiMessageDisplay;
