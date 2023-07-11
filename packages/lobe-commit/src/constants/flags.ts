export interface IFlags {
  [flag: string]: {
    desc?: string;
    shortFlag?: string;
    type: 'boolean' | 'string';
  };
}

const FLAGS: IFlags = {
  ai: { desc: 'Generate prompts by ChatGPT', shortFlag: 'a', type: 'boolean' },
  commit: { desc: 'Interactively commit using the prompts', shortFlag: 'c', type: 'boolean' },
  config: { desc: 'Setup lobe-commit preferences', shortFlag: 'o', type: 'boolean' },
  help: { desc: 'Print basic options', shortFlag: 'h', type: 'boolean' },
  hook: { type: 'boolean' },
  init: { desc: 'Initialize lobe-commit as a commit hook', shortFlag: 'i', type: 'boolean' },
  list: { desc: 'List all the available commit type', shortFlag: 'l', type: 'boolean' },
  remove: { desc: 'Remove a previously initialized commit hook', shortFlag: 'r', type: 'boolean' },
  version: { desc: 'Print lobe-commit installed version', shortFlag: 'v', type: 'boolean' },
};

export default FLAGS;
