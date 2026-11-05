import { type BoxProps, Text, useApp } from 'ink';
import type { ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';

import { useTheme } from '../hooks/useTheme';
import Panel from '../Panel';
import SelectInput, { type SelectInputItem, type SelectInputProps } from '../SelectInput';
import ConfigSelectLabel from './ConfigSelectLabel';

export interface ConfigPanelItem {
  children: ReactNode;
  defaultValue: any;
  desc?: string;
  key: string;
  label: string;
  showValue?: boolean;
  value: any;
}
export interface ConfigPanelProps extends BoxProps {
  active?: string;
  items: ConfigPanelItem[];
  logo?: string;
  maxLength?: number;
  setActive?: (key: string) => void;
  show?: boolean;
  title?: string;
}
const ConfigPanel = memo<ConfigPanelProps>(
  ({ active, setActive, maxLength = 30, show = true, items, logo, title, ...props }) => {
    const [activeItem, setAciveItem] = useState<ConfigPanelItem>();
    const theme = useTheme();
    const { exit } = useApp();
    const options: SelectInputProps['items'] = useMemo(
      () => [
        ...items.map((item) => ({
          label: (
            <ConfigSelectLabel
              defaultValue={item.defaultValue}
              label={item.label}
              maxLength={maxLength}
              showValue={item.showValue}
              value={item.value}
            />
          ),
          value: item.key,
        })),
        {
          label: 'Exit',
          value: 'exit',
        },
      ],
      [items],
    );

    const handleSelect = (e: SelectInputItem) => {
      if (e.value === 'exit') exit();
      const activeOption = items.find((item) => item.key === e.value);
      if (activeOption) {
        setAciveItem(activeOption);
        setActive?.(e.value);
      }
    };

    if (!show) return;

    return active && activeItem ? (
      <Panel
        title={[logo, activeItem.label].filter(Boolean).join(' ')}
        footer={
          activeItem.desc && (
            <Text color={theme.colorTextDescription}>
              <Text bold>{`👉NOTE: `}</Text>
              {activeItem.desc}
            </Text>
          )
        }
        {...props}
      >
        {activeItem.children}
      </Panel>
    ) : (
      <Panel show={!active} title={[logo, title].filter(Boolean).join(' ')} {...props}>
        <SelectInput items={options} onSelect={handleSelect} />
      </Panel>
    );
  },
);

export default ConfigPanel;
