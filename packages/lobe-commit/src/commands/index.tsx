import { ThemeProvider, defaultTheme, extendTheme } from '@inkjs/ui';
import { useTheme } from '@lobehub/cli-ui';
import { memo, useEffect } from 'react';
// @ts-ignore
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';

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
            } else if (isFocused) {
              color = theme.colorPrimary;
            }

            return { color };
          },
          selectedIndicator: () => ({
            color: theme.colorPrimary,
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
