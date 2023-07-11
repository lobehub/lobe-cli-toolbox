import { Fragment, type ReactNode, memo } from 'react';

export interface TabItem {
  children: ReactNode;
  key: string | number;
}

export interface TabsProps {
  activeKey: string | number;
  items: TabItem[];
}

const Tabs = memo<TabsProps>(({ activeKey, items }) => {
  return (
    <>
      {items.map(
        (item) => activeKey === item.key && <Fragment key={item.key}>{item.children}</Fragment>,
      )}
    </>
  );
});

export default Tabs;
