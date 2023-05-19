import React, { Fragment } from 'react';
import BorderView from './BorderView';
import Header from './Header';

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
              <BorderView>{item.children}</BorderView>
            </Fragment>
          ),
      )}
    </>
  );
};

export default React.memo(TabsWithHeader);
