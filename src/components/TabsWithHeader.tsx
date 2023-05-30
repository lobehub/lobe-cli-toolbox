import { Fragment, memo, type ReactNode } from 'react';

import BorderView from './BorderView';
import Header from './Header';

export interface TabsWithHeaderItem {
  children: ReactNode;
  key: string | number;
  title: string;
}

interface TabsWithHeaderProps {
  activeKey: string | number;
  items: TabsWithHeaderItem[];
}

const TabsWithHeader = memo<TabsWithHeaderProps>(({ activeKey, items }) => {
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
});

export default TabsWithHeader;
