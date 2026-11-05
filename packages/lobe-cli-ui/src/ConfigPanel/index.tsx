import { Box, Text, useApp, useInput } from 'ink';
import type { ReactNode } from 'react';
import { memo, useState } from 'react';

import { useTheme } from '../hooks/useTheme';
import type { KeyHint } from '../KeyHints';
import Panel, { Intro } from '../Panel';
import SelectInput from '../SelectInput';
import symbols from '../styles/symbols';

export interface ConfigPanelItem {
  desc?: string;
  /** Key hints of the edit view, defaults to enter / esc. */
  hints?: KeyHint[];
  key: string;
  label: string;
  /** Differs from the default; shown with a marker. */
  modified?: boolean;
  /** The editor handles esc itself (calling `close`), e.g. a multi-step form. */
  ownsEscape?: boolean;
  /** `close(true)` returns to the list with a "saved" notice. */
  render: (close: (saved?: boolean) => void) => ReactNode;
  /** Hide the value, only show whether it is set. */
  secret?: boolean;
  value?: string | number | boolean;
}

export interface ConfigPanelProps {
  items: ConfigPanelItem[];
  /** Prepended to the title, e.g. an emoji. */
  logo?: string;
  subtitle?: string;
  title: string;
}

const EDIT_HINTS: KeyHint[] = [
  ['enter', 'save'],
  ['esc', 'back'],
];

const ValueText = memo<{ item: ConfigPanelItem }>(({ item }) => {
  const theme = useTheme();
  const { modified, secret, value } = item;
  const empty = value === undefined || value === '';
  const text = secret
    ? empty
      ? 'not set'
      : '••••••••'
    : typeof value === 'boolean'
      ? value
        ? 'on'
        : 'off'
      : empty
        ? 'not set'
        : String(value);

  return (
    <Text wrap="truncate-end">
      <Text dimColor={!modified}>{text}</Text>
      {modified && <Text color={theme.colorPrimary}>{` ${symbols.bullet}`}</Text>}
    </Text>
  );
});

/** A list of settings; enter edits one, esc goes back to the list and then exits. */
const ConfigPanel = memo<ConfigPanelProps>(({ items, logo, subtitle, title }) => {
  const theme = useTheme();
  const { exit } = useApp();
  const [editing, setEditing] = useState<string>();
  const [highlighted, setHighlighted] = useState(items[0]?.key);
  const [notice, setNotice] = useState<string>();

  const active = items.find((item) => item.key === editing);
  const current = items.find((item) => item.key === highlighted);
  const labelWidth = Math.max(...items.map((item) => item.label.length)) + 4;

  const close = (saved?: boolean) => {
    setNotice(saved && active ? `${active.label} saved` : undefined);
    setEditing(undefined);
  };

  useInput(
    (input, key) => {
      if (active) {
        if (key.escape && !active.ownsEscape) close();
        return;
      }
      if (key.escape || input === 'q') exit();
    },
    { isActive: !active || !active.ownsEscape },
  );

  const heading = <Intro subtitle={subtitle} title={[logo, title].filter(Boolean).join(' ')} />;

  if (active) {
    return (
      <Box flexDirection="column" key={`edit-${active.key}`}>
        {heading}
        <Panel
          hints={active.ownsEscape ? undefined : (active.hints ?? EDIT_HINTS)}
          title={active.label}
        >
          {active.render(close)}
          {active.desc && (
            <Box marginTop={1}>
              <Text dimColor>{active.desc}</Text>
            </Box>
          )}
        </Panel>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" key="list">
      {heading}
      <Panel
        title="Settings"
        hints={[
          ['↑↓', 'move'],
          ['enter', 'edit'],
          ['esc', 'exit'],
        ]}
      >
        <SelectInput
          initialValue={highlighted}
          labelWidth={labelWidth}
          items={items.map((item) => ({
            hint: <ValueText item={item} />,
            label: item.label,
            value: item.key,
          }))}
          onHighlight={(item) => {
            if (item.value !== highlighted) setNotice(undefined);
            setHighlighted(item.value);
          }}
          onSelect={(item) => {
            setNotice(undefined);
            setEditing(item.value);
          }}
        />
        <Box marginTop={1}>
          {notice ? (
            <Text color={theme.colorSuccess}>{`${symbols.tick} ${notice}`}</Text>
          ) : (
            <Text dimColor wrap="truncate-end">
              {current?.desc ?? ' '}
            </Text>
          )}
        </Box>
      </Panel>
    </Box>
  );
});

export default ConfigPanel;
