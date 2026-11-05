import type { ReactNode } from 'react';
import { memo, useEffect } from 'react';

import { useTheme } from '../hooks/useTheme';
import { defaultTheme, extendTheme, ThemeProvider as InkThemeProvider } from '../theme';

const ThemeProvider = memo<{ children: ReactNode }>(({ children }) => {
  const theme = useTheme();

  useEffect(() => {}, []);

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

  return <InkThemeProvider theme={customTheme}>{children}</InkThemeProvider>;
});

export default ThemeProvider;
