import { skillAgents } from '@lobehub/cli-common/skill';
import { runSkillInstall, type SkillFlags } from '@lobehub/cli-common/skillCommand';
import { alert, render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import { Ai, Commit, Config, HookCreate, HookRemove, List } from '@/commands';
import { migrateConfig } from '@/store/config';
import { migrateHook } from '@/utils/migrateHook';

import packageJson from '../package.json';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

if (migrateConfig()) alert.info('Migrated the lobe-commit config to the latest format');

const program = new Command();

interface Flags {
  ai?: boolean;
  hook?: string;
  init?: boolean;
  list?: boolean;
  option?: boolean;
  remove?: boolean;
}

program
  .name('lobe-commit')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('--hook <file>', 'Interactively commit using the prompts'))
  .addOption(new Option('-a, --ai', 'Generate prompts by ChatGPT'))
  .addOption(new Option('-o, --option', 'Setup lobe-commit preferences'))
  .addOption(new Option('-i, --init', 'Initialize lobe-commit as a commit hook'))
  .addOption(new Option('-r, --remove', 'Remove a previously initialized commit hook'))
  .addOption(new Option('-l, --list', 'List all commit types supported'))
  .action((options: Flags) => {
    // sh is still reading the hook file while it runs us
    if (!options.hook && migrateHook()) {
      alert.info('Updated the lobe-commit git hook to the latest version');
    }

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
      render(<Commit hook={options.hook} />);
    } else {
      render(<Commit />);
    }
  });

program
  .command('skill')
  .description('Install the lobe-commit skill for AI coding agents')
  .option('-g, --global', 'Install into the home directory instead of the current project')
  .addOption(
    new Option('--agent <agents...>', 'Agents to install for, detected by default').choices(
      skillAgents,
    ),
  )
  .action((flags: SkillFlags) => runSkillInstall('lobe-commit', import.meta.url, flags));

program.parse();
