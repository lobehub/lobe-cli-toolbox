const colors = {
  blue: '#8ae8ff',
  cyan: '#95f3d9',
  geekblue: '#369eff',
  gold: '#ffcb47',
  gray: '#777777',
  green: '#55b467',
  lime: '#c4f042',
  magenta: '#e34ba9',
  orange: '#ff802b',
  pink: '#eb2f96',
  purple: '#bd54c6',
  red: '#f04f88',
  volcano: '#ec5e41',
  yellow: '#ffef5c',
};

const typeColors = {
  colorError: 'red',
  colorInfo: 'blue',
  colorPrimary: 'cyan',
  colorSuccess: 'green',
  colorWarning: 'yellow',
};

export default {
  colorBgContainer: '#111111',
  colorBgElevated: '#222222',
  colorBgLayout: '#000000',
  colorBgSpotlight: '#444444',
  colorBorder: '#333333',
  colorBorderSecondary: '#2d2d2d',
  colorText: '#ffffff',
  colorTextDescription: '#6f6f6f',
  colorTextPlaceholder: '#555555',
  colorTextQuaternary: '#555555',
  colorTextSecondary: '#aaaaaa',
  colorTextTertiary: '#6f6f6f',
  ...typeColors,
  ...colors,
};
