import { render as inkRender } from 'ink';
import { ReactNode } from 'react';

import ThemeProvider from '@/ThemeProvider';

const render = (children: ReactNode) => {
  return inkRender(<ThemeProvider>{children}</ThemeProvider>);
};
export default render;
