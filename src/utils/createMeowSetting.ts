import cliui from 'cliui';

export default (flagsConst) => {
  // @ts-ignore
  const ui = cliui();
  const flags = {};
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
    text: 'Usage',
    padding: [1, 0, 0, 0],
  });

  ui.div({
    text: '$ lobe-commit  [option] [command]',
    padding: [0, 0, 0, 4],
  });

  ui.div({
    text: 'Options',
    padding: [1, 0, 0, 0],
  });

  ui.div({
    text: options,
    width: 800,
    padding: [0, 0, 0, 4],
  });

  return {
    help: ui.toString(),
    flags,
  };
};
