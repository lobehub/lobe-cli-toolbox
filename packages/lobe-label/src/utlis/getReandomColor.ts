import { sample } from 'lodash-es';

export const getReandomColor = (color?: string): string => {
  if (!color) {
    return 'ededed';
  }
  if (color !== 'auto') {
    return color;
  }
  const colors = [
    '60acfc',
    '32d3eb',
    '5bc49f',
    'feb64d',
    '9287e7',
    '3db3ea',
    '43cec7',
    'd4ec59',
    'f7816d',
    'd660a8',
    '636fde',
    '42c5ea',
    '62d5b2',
    'fbda43',
    'f66e6c',
    'b55bbd',
    '668ed6',
    'B60205',
    'E99695',
    'D93F0B',
    'F9D0C4',
    'FBCA04',
    'FEF2C0',
    '0E8A16',
    'C2E0C6',
    '006B75',
    'BFDADC',
    '1D76DB',
    'BFD4F2',
    '0052CC',
    'BFD4F2',
    '5319E7',
    'D4C5F9',
  ];

  return sample(colors) as string;
};
