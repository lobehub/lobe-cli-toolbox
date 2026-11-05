const colors = {
  blue: '#5cc8ff',
  cyan: '#56d4c8',
  geekblue: '#6b8cff',
  gold: '#f5c451',
  gray: '#8a8a8a',
  green: '#4ade80',
  lime: '#bef264',
  magenta: '#f472b6',
  orange: '#fb923c',
  pink: '#ec4899',
  purple: '#a78bfa',
  red: '#f87171',
  volcano: '#f97316',
  yellow: '#facc15',
};

/**
 * Text uses the terminal's own foreground; only accents are hard-coded so light themes stay readable.
 */
export default {
  ...colors,
  colorBorder: '#4b4b4b',
  colorError: colors.red,
  colorInfo: colors.blue,
  colorPrimary: colors.purple,
  colorSuccess: colors.green,
  colorTextDescription: colors.gray,
  colorWarning: colors.yellow,
};
