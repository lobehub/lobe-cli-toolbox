import cliui from 'cliui';

import { IFlags } from '@/constants/flags';

export default (flagsConst: IFlags) => {
  // @ts-ignore
  const ui = cliui();
  const flags: any = {};
  const options = Object.entries(flagsConst)
    .map((item) => {
      if (!item[1].desc) return '';
      flags[item[0]] = {
        shortFlag: item[1].shortFlag,
        type: item[1].type,
      };
      return `--${item[0]}, -${item[1].shortFlag}\t ${item[1].desc}`;
    })
    .filter(Boolean)
    .join('\n');

  ui.div({
    padding: [1, 0, 0, 0],
    text: 'Usage',
  });

  ui.div({
    padding: [0, 0, 0, 4],
    text: '$ lobe-commit  [option] [command]',
  });

  ui.div({
    padding: [1, 0, 0, 0],
    text: 'Options',
  });

  ui.div({
    padding: [0, 0, 0, 4],
    text: options,
    width: 800,
  });

  return {
    flags,
    help: ui.toString(),
  };
};
