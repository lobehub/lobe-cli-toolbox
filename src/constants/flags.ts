interface IFlags {
  [flag: string]: {
    type: 'boolean' | 'string';
    shortFlag: string;
    desc: string;
  };
}

const FLAGS: IFlags = {
  commit: { type: 'boolean', shortFlag: 'c', desc: 'Interactively commit using the prompts' },
  config: { type: 'boolean', shortFlag: 'g', desc: 'Setup gitmoji-cli preferences' },
  help: { type: 'boolean', shortFlag: 'h', desc: 'Print basic options' },
  init: { type: 'boolean', shortFlag: 'i', desc: 'Initialize gitmoji as a commit hook' },
  list: { type: 'boolean', shortFlag: 'l', desc: 'List all the available gitmojis' },
  remove: { type: 'boolean', shortFlag: 'r', desc: 'Remove a previously initialized commit hook' },
  update: { type: 'boolean', shortFlag: 'u', desc: 'Sync emoji list with the repo' },
  version: { type: 'boolean', shortFlag: 'v', desc: 'Print gitmoji-cli installed version' },
};

export default FLAGS;
