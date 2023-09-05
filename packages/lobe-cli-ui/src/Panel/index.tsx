import { Box, type BoxProps, Text } from 'ink';
import { ReactNode, memo } from 'react';

import { useTheme } from '@/hooks/useTheme';

export interface PanelProps extends BoxProps {
  bodyConfig?: BoxProps;
  children: ReactNode;
  footer?: ReactNode;
  footerConfig?: BoxProps;
  header?: ReactNode;
  headerConfig?: BoxProps;
  reverse?: boolean;
  show?: boolean;
  title?: string;
}
const Panel = memo<PanelProps>(
  ({
    show = true,
    children,
    footer,
    reverse = false,
    header,
    headerConfig,
    footerConfig,
    bodyConfig,
    title,
    ...props
  }) => {
    const theme = useTheme();
    if (!show) return;
    const headerNode = (title || header) && (
      <Box
        borderColor={theme.colorBorder}
        borderLeft={false}
        borderRight={false}
        borderStyle={'bold'}
        borderTop={false}
        flexDirection={'row'}
        justifyContent={'center'}
        paddingLeft={1}
        paddingRight={1}
        {...headerConfig}
      >
        {title ? <Text bold>{title.toUpperCase()}</Text> : header}
      </Box>
    );
    const bodyNode = (
      <Box flexDirection={'column'} paddingLeft={1} paddingRight={1} {...bodyConfig}>
        {children}
      </Box>
    );
    const footerNode = footer && (
      <Box
        borderBottom={reverse}
        borderColor={theme.colorBorder}
        borderLeft={false}
        borderRight={false}
        borderStyle={'single'}
        borderTop={!reverse}
        flexDirection={'row'}
        paddingLeft={1}
        paddingRight={1}
        {...footerConfig}
      >
        {footer}
      </Box>
    );
    return (
      <Box
        alignItems={'stretch'}
        borderColor={theme.colorBorder}
        borderStyle={'bold'}
        flexDirection={'column'}
        {...props}
      >
        {headerNode}
        {reverse ? footerNode : bodyNode}
        {reverse ? bodyNode : footerNode}
      </Box>
    );
  },
);

export default Panel;
