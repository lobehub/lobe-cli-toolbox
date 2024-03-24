// import { ProgressBar, Spinner, StatusMessage } from '@inkjs/ui';
// import { SplitView, useTheme } from '@lobehub/cli-ui';
// import { Box, Text } from 'ink';
// import { memo } from 'react';
//
// import { onProgressProps } from '@/core/Seo';
//
// interface ProgressProps extends onProgressProps {
//   filename: string;
//   from: string;
//   hide?: boolean;
//   to: string;
// }
//
// const Progress = memo<ProgressProps>(
//   ({ hide, filename, to, from, progress, maxStep, step, isLoading, needToken }) => {
//     const theme = useTheme();
//
//     if (hide) return null;
//
//     return (
//       <SplitView flexDirection={'column'}>
//         <Text backgroundColor={theme.colorBgLayout} color={theme.colorText}>
//           {` 📝 ${filename} `}
//         </Text>
//         <Text color={theme.colorTextDescription}>
//           {`- from `}
//           <Text bold color={theme.colorInfo}>
//             {from}
//           </Text>
//           {` to `}
//           <Text bold color={theme.colorInfo}>
//             {to}
//           </Text>
//           <Text color={theme.colorTextDescription}>{` [Tokens: ${needToken}]`}</Text>
//         </Text>
//         {isLoading ? (
//           <Box>
//             <Spinner label={` ${progress}% [${step}/${maxStep} chunks] `} />
//             <ProgressBar value={progress} />
//           </Box>
//         ) : (
//           <StatusMessage variant={'success'}>Success</StatusMessage>
//         )}
//       </SplitView>
//     );
//   },
// );
//
// export default Progress;
