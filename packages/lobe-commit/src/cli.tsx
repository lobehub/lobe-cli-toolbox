import { existsSync } from 'node:fs';

import { skillAgents } from '@lobehub/cli-common/skill';
import { runSkillInstall, type SkillFlags } from '@lobehub/cli-common/skillCommand';
import { alert, render } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import { Ai, Commit, Config, createHook, isLobeCommitHook, List, removeHook } from '@/commands';
import { HOOK } from '@/constants/hook';
import { migrateConfig } from '@/store/config';
import getAbsoluteHooksPath from '@/utils/getAbsoluteHooksPath';
import { commitWithMessage, hasStagedChanges } from '@/utils/git';
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

/** Runs the wizard, then commits once Ink is gone so git (and its hooks) own the terminal. */
const runCommit = async (hookFile?: string) => {
  if (!hookFile) {
    const hookPath = getAbsoluteHooksPath(HOOK.FILENAME);
    if (existsSync(hookPath) && isLobeCommitHook(hookPath)) {
      alert.warn(
        `lobe-commit is installed as a git hook, run ${chalk.bold('git commit')} instead`,
        true,
      );
    }
    if (!hasStagedChanges()) {
      alert.error(`Nothing is staged, run ${chalk.bold('git add')} first`, true);
    }
  }

  const message = await render(<Commit hook={!!hookFile} />).waitUntilExit();
  if (typeof message !== 'string' || !message || !commitWithMessage(message, hookFile)) {
    process.exitCode = 1;
  }
};

program
  .name('lobe-commit')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('--hook <file>', 'Run as the prepare-commit-msg hook'))
  .addOption(new Option('-a, --ai', 'Generate a commit message with AI and print it'))
  .addOption(new Option('-o, --option', 'Setup lobe-commit preferences'))
  .addOption(new Option('-i, --init', 'Install lobe-commit as a git hook'))
  .addOption(new Option('-r, --remove', 'Remove the lobe-commit git hook'))
  .addOption(new Option('-l, --list', 'List all supported commit types'))
  .action(async (options: Flags) => {
    // sh is still reading the hook file while it runs us
    if (!options.hook && migrateHook()) {
      alert.info('Updated the lobe-commit git hook to the latest version');
    }

    if (options.ai) {
      await render(<Ai />).waitUntilExit();
    } else if (options.option) {
      await render(<Config />).waitUntilExit();
    } else if (options.init) {
      createHook();
    } else if (options.remove) {
      removeHook();
    } else if (options.list) {
      List();
    } else {
      await runCommit(options.hook);
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

await program.parseAsync();
