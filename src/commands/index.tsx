import { ThemeProvider, defaultTheme, extendTheme } from '@inkjs/ui';
import { memo, useEffect } from 'react';
// @ts-ignore
import updateNotifier from 'update-notifier';

import packageJson from '../../package.json';
import { useTheme } from '../hooks/useTheme';
import App, { type AppProps } from './App';

const Index = memo<AppProps>((props) => {
  const theme = useTheme();

  useEffect(() => {
    const notifier = updateNotifier({ pkg: packageJson });
    notifier.notify();
  }, []);

  const customTheme = extendTheme(defaultTheme, {
    components: {
      Select: {
        styles: {
          focusIndicator: () => ({
            color: theme.colorInfo,
          }),
          label({ isFocused, isSelected }) {
            let color: string | undefined;

            if (isSelected) {
              color = theme.colorSuccess;
            }

            if (isFocused) {
              color = theme.colorInfo;
            }

            return { color };
          },
          selectedIndicator: () => ({
            color: theme.colorSuccess,
          }),
        },
      },
    },
  });

  return (
    <ThemeProvider theme={customTheme}>
      <App {...props} />
    </ThemeProvider>
  );
});

export default Index;
