import React, { Fragment } from 'react';
import { Header } from './index';

export interface TabsWithHeaderItem {
  title: string;
  key: string | number;
  children: React.ReactNode;
}

interface TabsWithHeaderProps {
  activeKey: string | number;
  items: TabsWithHeaderItem[];
}

const TabsWithHeader: React.FC<TabsWithHeaderProps> = ({ activeKey, items }) => {
  return (
    <>
      {items.map(
        (item) =>
          activeKey === item.key && (
            <Fragment key={item.key}>
              <Header title={item.title} />
              {item.children}
            </Fragment>
          ),
      )}
    </>
  );
};

export default React.memo(TabsWithHeader);
