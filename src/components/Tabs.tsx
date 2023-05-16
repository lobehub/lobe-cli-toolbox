import React, { Fragment } from 'react';

export interface TabItem {
  key: string | number;
  children: React.ReactNode;
}

export interface TabsProps {
  activeKey: string | number;
  items: TabItem[];
}

const Tabs: React.FC<TabsProps> = ({ activeKey, items }) => {
  return (
    <>
      {items.map(
        (item) => activeKey === item.key && <Fragment key={item.key}>{item.children}</Fragment>,
      )}
    </>
  );
};

export default React.memo(Tabs);
