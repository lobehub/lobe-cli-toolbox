import { ProgressBar, Spinner, StatusMessage } from '@inkjs/ui';
import { SplitView, useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo } from 'react';

import { onProgressProps } from '@/core/I18n';

interface QueryItemProps extends onProgressProps {
  filename: string;
  from: string;
  to: string;
}

const QueryItem = memo<QueryItemProps>(({ filename, to, from, progress, maxStep, step }) => {
  const theme = useTheme();

  return (
    <SplitView flexDirection={'column'}>
      <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
        {` 📝 ${filename} `}
      </Text>
      {step === maxStep ? (
        <StatusMessage variant={'success'}>Success</StatusMessage>
      ) : (
        <Box>
          <Spinner label={`${progress}%`} />
          <Box marginLeft={1} marginRight={1} width={20}>
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
          </Box>
          <ProgressBar value={Math.floor((step / maxStep) * 100)} />
        </Box>
      )}
    </SplitView>
  );
});

export default QueryItem;
