import deepmerge from 'deepmerge';
import { type ReactNode, createContext, useContext } from 'react';

import alertTheme from './components/alert/theme';
import badgeTheme from './components/badge/theme';
import confirmInputTheme from './components/confirm-input/theme';
import emailInputTheme from './components/email-input/theme';
import multiSelectTheme from './components/multi-select/theme';
import orderedListTheme from './components/ordered-list/theme';
import passwordInputTheme from './components/password-input/theme';
import progressBarTheme from './components/progress-bar/theme';
import selectTheme from './components/select/theme';
import spinnerTheme from './components/spinner/theme';
import statusMessageTheme from './components/status-message/theme';
import textInputTheme from './components/text-input/theme';
import unorderedListTheme from './components/unordered-list/theme';

export type Theme = {
  components: Record<string, ComponentTheme>;
};

export type ComponentTheme = {
  config?: (props?: any) => Record<string, unknown>;
  styles?: Record<string, (props?: any) => ComponentStyles>;
};

export type ComponentStyles = Record<string, unknown>;

export const defaultTheme: Theme = {
  components: {
    Alert: alertTheme,
    Badge: badgeTheme,
    ConfirmInput: confirmInputTheme,
    EmailInput: emailInputTheme,
    MultiSelect: multiSelectTheme,
    OrderedList: orderedListTheme,
    PasswordInput: passwordInputTheme,
    ProgressBar: progressBarTheme,
    Select: selectTheme,
    Spinner: spinnerTheme,
    StatusMessage: statusMessageTheme,
    TextInput: textInputTheme,
    UnorderedList: unorderedListTheme,
  },
};

export const ThemeContext = createContext<Theme>(defaultTheme);

export type ThemeProviderProps = {
  readonly children: ReactNode;
  readonly theme: Theme;
};

export function ThemeProvider({ children, theme }: ThemeProviderProps) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export const extendTheme = (originalTheme: Theme, newTheme: Theme) => {
  return deepmerge(originalTheme, newTheme);
};

export const useComponentTheme = <Theme extends ComponentTheme>(component: string): Theme => {
  const theme = useContext(ThemeContext);
  return theme.components[component] as Theme;
};
