import { Text } from 'ink';
import { memo, useMemo } from 'react';

import { useTheme } from '@/hooks/useTheme';

import { Badge } from '../components/badge';

export interface ConfigSelectLabelProps {
  defaultValue: any;
  label: string;
  maxLength?: number;
  showValue?: boolean;
  value: any;
}

const ConfigSelectLabel = memo<ConfigSelectLabelProps>(
  ({ maxLength = 30, defaultValue, label, showValue = true, value }) => {
    const theme = useTheme();

    const spacedLabel = useMemo(
      () =>
        label +
        Array.from({ length: maxLength - label.length })
          .fill('')
          .join(' '),
      [label, maxLength],
    );

    const isDefault = useMemo(() => defaultValue === value, [defaultValue, value]);

    return (
      <Text>
        {spacedLabel}
        {defaultValue ? (
          <Badge color={isDefault ? theme.colorText : theme.colorInfo}>
            {showValue ? value : isDefault ? 'DEFAULT' : 'CUSTOM'}
          </Badge>
        ) : (
          <Badge color={isDefault ? theme.colorError : theme.colorSuccess}>
            {showValue ? value : isDefault ? 'UNSET' : 'SET'}
          </Badge>
        )}
      </Text>
    );
  },
);

export default ConfigSelectLabel;
