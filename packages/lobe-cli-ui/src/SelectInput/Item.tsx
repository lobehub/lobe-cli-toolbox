import { Text } from 'ink';
import { type ReactNode, memo } from 'react';

export interface ItemProps {
  highlightColor: string;
  isSelected?: boolean;
  label: string | ReactNode;
}

const Item = memo<ItemProps>(({ highlightColor, isSelected = false, label }) => {
  return <Text color={isSelected ? highlightColor : undefined}>{label}</Text>;
});

export default Item;
