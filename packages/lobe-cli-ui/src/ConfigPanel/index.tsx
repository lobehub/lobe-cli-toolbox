import { type BoxProps } from 'ink';
import { Text } from 'ink';
import { ReactNode, memo, useMemo, useState } from 'react';

import Panel from '@/Panel';
import SelectInput, { type SelectInputProps } from '@/SelectInput';
import { useTheme } from '@/hooks/useTheme';

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
  items: ConfigPanelItem[];
  logo?: string;
  show?: boolean;
  title?: string;
}
const ConfigPanel = memo<ConfigPanelProps>(({ show = true, items, logo, title, ...props }) => {
  const [active, setActive] = useState<string>();
  const [activeItem, setAciveItem] = useState<ConfigPanelItem>();
  const theme = useTheme();

  const options: SelectInputProps['items'] = useMemo(
    () =>
      items.map((item) => ({
        label: item.label,
        value: item.key,
      })),
    [items],
  );

  const handleSelect: SelectInputProps['onSelect'] = (e) => {
    const active = items.find((item) => item.key === e.value);
    if (active) {
      setAciveItem(active);
      setActive(e.value);
    }
  };

  if (!show) return;

  return activeItem ? (
    <Panel
      footer={activeItem.desc && <Text color={theme.colorTextDescription}>{activeItem.desc}</Text>}
      reverse
      title={[logo, activeItem.label].filter(Boolean).join(' ')}
      {...props}
    >
      {activeItem.children}
    </Panel>
  ) : (
    <Panel show={!active} title={[logo, title].filter(Boolean).join(' ')} {...props}>
      <SelectInput items={options} onSelect={handleSelect} />
    </Panel>
  );
});

export default ConfigPanel;
