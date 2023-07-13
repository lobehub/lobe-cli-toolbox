/* @shebangs */
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
  .addOption(new Option('-h, --hook', 'Interactively commit using the prompts'))
  .addOption(new Option('-a, --ai', 'Generate prompts by ChatGPT'))
  .addOption(new Option('-o, --config', 'Setup lobe-commit preferences'))
  .addOption(new Option('-i, --init', 'Initialize lobe-commit as a commit hook'))
  .addOption(new Option('-r, --remove', 'Remove a previously initialized commit hook'))
  .addOption(new Option('-l, --list', 'List all commit types supported'))
  .parse();

interface Flags {
  ai?: boolean;
  config?: boolean;
  hook?: boolean;
  init?: boolean;
  list?: boolean;
  remove?: boolean;
}

const options: Flags = program.opts();
if (!options) render(<Commit />);
if (options.hook) render(<Commit hook />);
if (options.ai) render(<Ai />);
if (options.config) render(<Config />);
if (options.init) render(<HookCreate />);
if (options.remove) render(<HookRemove />);
if (options.list) render(<List />);
