import { ProgressBar, Spinner, StatusMessage } from '@inkjs/ui';
import { SplitView, useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo } from 'react';

import { onProgressProps } from '@/core/I18n';

interface ProgressProps extends onProgressProps {
  filename: string;
  from: string;
  to: string;
}

const Progress = memo<ProgressProps>(
  ({ filename, to, from, progress, maxStep, step, isLoading }) => {
    const theme = useTheme();

    return (
      <SplitView flexDirection={'column'}>
        <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
          {` 📝 ${filename} `}
        </Text>
        <Text color={theme.colorTextDescription}>
          {`- from `}
          <Text bold color={theme.colorInfo}>
            {from}
          </Text>
          {` to `}
          <Text bold color={theme.colorInfo}>
            {to}
          </Text>
        </Text>
        {isLoading ? (
          <Box>
            <Spinner label={` ${progress}% [${step}/${maxStep} chunks] `} />
            <ProgressBar value={progress} />
          </Box>
        ) : (
          <StatusMessage variant={'success'}>Success</StatusMessage>
        )}
      </SplitView>
    );
  },
);

export default Progress;
