import { ProgressBar, Spinner, SplitView, StatusMessage, useTheme } from '@lobehub/cli-ui';
import { Box, Text } from 'ink';
import { memo, useEffect, useRef, useState } from 'react';

import type { onProgressProps } from '@/core/I18n';

interface ProgressProps extends onProgressProps {
  filename: string;
  from: string;
  hide?: boolean;
  to: string;
}

const Progress = memo<ProgressProps>(
  ({ hide, filename, to, from, progress, maxStep, step, isLoading, needToken }) => {
    const theme = useTheme();
    const [animatedProgress, setAnimatedProgress] = useState(0);
    const targetProgressRef = useRef(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
      targetProgressRef.current = progress;

      // 清理之前的动画
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // 开始新的动画
      intervalRef.current = setInterval(() => {
        setAnimatedProgress((current) => {
          const target = targetProgressRef.current;
          const diff = target - current;

          if (Math.abs(diff) < 1) {
            // 到达目标，清理动画
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = null;
            }
            return target;
          }

          // 减慢动画速度：每次移动差值的5%，但至少0.2%，最多1%
          const step = Math.sign(diff) * Math.max(0.2, Math.min(1, Math.abs(diff) * 0.05));
          return current + step;
        });
      }, 300); // 增加更新间隔到300ms

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }, [progress]);

    if (hide) return null;

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
          <Text color={theme.colorTextDescription}>{` [Tokens: ${needToken}]`}</Text>
        </Text>
        {isLoading ? (
          <Box>
            <Spinner label={` ${Math.round(animatedProgress)}% [${step}/${maxStep} chunks] `} />
            <ProgressBar value={Math.round(animatedProgress)} />
          </Box>
        ) : (
          <StatusMessage variant={'success'}>Success</StatusMessage>
        )}
      </SplitView>
    );
  },
);

export default Progress;
