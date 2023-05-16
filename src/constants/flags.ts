export interface IFlags {
  [flag: string]: {
    type: 'boolean' | 'string';
    shortFlag?: string;
    desc?: string;
  };
}

const FLAGS: IFlags = {
  commit: { type: 'boolean', shortFlag: 'c', desc: 'Interactively commit using the prompts' },
  config: { type: 'boolean', shortFlag: 'o', desc: 'Setup lobe-commit preferences' },
  help: { type: 'boolean', shortFlag: 'h', desc: 'Print basic options' },
  init: { type: 'boolean', shortFlag: 'i', desc: 'Initialize lobe-commit as a commit hook' },
  list: { type: 'boolean', shortFlag: 'l', desc: 'List all the available commit type' },
  remove: { type: 'boolean', shortFlag: 'r', desc: 'Remove a previously initialized commit hook' },
  version: { type: 'boolean', shortFlag: 'v', desc: 'Print lobe-commit installed version' },
  hook: { type: 'boolean' },
};

export default FLAGS;
