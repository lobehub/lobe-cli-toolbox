import { Box, type BoxProps, Text } from 'ink';
import type { ReactNode } from 'react';
import { memo } from 'react';

import { useTheme } from '../hooks/useTheme';
import KeyHints, { type KeyHint } from '../KeyHints';
import symbols from '../styles/symbols';

export type PanelStatus = 'active' | 'done' | 'error' | 'warning';

export interface PanelProps extends BoxProps {
  children?: ReactNode;
  /** Shown after the closing `└`, `hints` render here when there is no footer. */
  footer?: ReactNode;
  hints?: (KeyHint | false | null | undefined)[];
  show?: boolean;
  status?: PanelStatus;
  /** Dimmed text right after the title. */
  subtitle?: ReactNode;
  title?: ReactNode;
}

const ICONS: Record<PanelStatus, string> = {
  active: symbols.active,
  done: symbols.done,
  error: symbols.error,
  warning: symbols.warning,
};

/**
 * A wizard step: a status icon with the title, a left rail along the body and the key hints below.
 */
const Panel = memo<PanelProps>(
  ({ children, footer, hints, show = true, status = 'active', subtitle, title, ...props }) => {
    const theme = useTheme();
    if (!show) return null;

    const color = {
      active: theme.colorPrimary,
      done: theme.colorBorder,
      error: theme.colorError,
      warning: theme.colorWarning,
    }[status];
    const footerNode = footer ?? (hints && hints.length > 0 && <KeyHints hints={hints} />);

    return (
      <Box flexDirection="column" {...props}>
        {(title || subtitle) && (
          <Text wrap="truncate-end">
            <Text color={color}>{`${ICONS[status]}  `}</Text>
            {title && <Text bold>{title}</Text>}
            {subtitle && <Text dimColor>{`  ${subtitle}`}</Text>}
          </Text>
        )}
        {children !== undefined && children !== null && children !== false && (
          <Box
            borderBottom={false}
            borderColor={color}
            borderRight={false}
            borderStyle="single"
            borderTop={false}
            flexDirection="column"
            paddingLeft={2}
          >
            {children}
          </Box>
        )}
        <Text wrap="truncate-end">
          <Text color={color}>{symbols.barEnd}</Text>
          {footerNode && <Text>{'  '}</Text>}
          {footerNode}
        </Text>
      </Box>
    );
  },
);

export default Panel;

export interface StepSummaryProps {
  label: string;
  labelWidth?: number;
  value?: ReactNode;
}

/** A finished step collapsed to one line, followed by the rail. */
export const StepSummary = memo<StepSummaryProps>(({ label, labelWidth = 10, value }) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column">
      <Box>
        <Text color={theme.colorBorder}>{`${symbols.done}  `}</Text>
        <Box flexShrink={0} width={labelWidth}>
          <Text dimColor>{label}</Text>
        </Box>
        {value === undefined || value === '' ? (
          <Text dimColor>—</Text>
        ) : (
          <Text wrap="truncate-end">{value}</Text>
        )}
      </Box>
      <Text color={theme.colorBorder}>{symbols.bar}</Text>
    </Box>
  );
});

export interface IntroProps {
  subtitle?: string;
  title: ReactNode;
}

/** Opening line of an interactive flow, e.g. `┌  🤯 Lobe Commit  v2.0.0`. */
export const Intro = memo<IntroProps>(({ title, subtitle }) => {
  const theme = useTheme();
  return (
    <Box flexDirection="column">
      <Text wrap="truncate-end">
        <Text color={theme.colorBorder}>{`${symbols.barStart}  `}</Text>
        <Text bold color={theme.colorPrimary}>
          {title}
        </Text>
        {subtitle && <Text dimColor>{`  ${subtitle}`}</Text>}
      </Text>
      <Text color={theme.colorBorder}>{symbols.bar}</Text>
    </Box>
  );
});
