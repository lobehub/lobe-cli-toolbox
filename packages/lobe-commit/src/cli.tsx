import { render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import { Ai, Commit, Config, HookCreate, HookRemove, List } from '@/commands';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

const program = new Command();

program
  .name('lobe-commit')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('--hook', 'Interactively commit using the prompts'))
  .addOption(new Option('-a, --ai', 'Generate prompts by ChatGPT'))
  .addOption(new Option('-o, --option', 'Setup lobe-commit preferences'))
  .addOption(new Option('-i, --init', 'Initialize lobe-commit as a commit hook'))
  .addOption(new Option('-r, --remove', 'Remove a previously initialized commit hook'))
  .addOption(new Option('-l, --list', 'List all commit types supported'))
  .parse();

interface Flags {
  ai?: boolean;
  hook?: boolean;
  init?: boolean;
  list?: boolean;
  option?: boolean;
  remove?: boolean;
}

const options: Flags = program.opts();

if (options.ai) {
  render(<Ai />);
} else if (options.option) {
  render(<Config />);
} else if (options.init) {
  render(<HookCreate />);
} else if (options.remove) {
  render(<HookRemove />);
} else if (options.list) {
  render(<List />);
} else if (options.hook) {
  render(<Commit hook />);
} else {
  render(<Commit />);
}
