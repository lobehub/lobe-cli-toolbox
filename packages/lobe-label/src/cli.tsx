import { skillAgents } from '@lobehub/cli-common/skill';
import { runSkillInstall, type SkillFlags } from '@lobehub/cli-common/skillCommand';
import { alert, render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import { consola } from 'consola';
import updateNotifier from 'update-notifier';

import Config from '@/commands/Config';
import Copy from '@/commands/Copy';
import { migrateConfig } from '@/store/confStore';

import packageJson from '../package.json';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

if (migrateConfig()) alert.info('Migrated the lobe-label config to the latest format');

const program = new Command();

interface Flags {
  config?: boolean;
  source: string;
  target?: string;
}

program
  .name('lobe-label')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-o, --config', 'Setup lobe-label preferences'))
  .addOption(new Option('-t, --target <repo>', 'Target repo'))
  .addOption(
    new Option('-s, --source <repo>', 'Source repo').default('canisminor1990/canisminor-template'),
  )
  .action(async (options: Flags) => {
    if (options.config) {
      render(<Config />);
    } else if (options.target) {
      if (!(await Copy(options.target, options.source))) process.exitCode = 1;
    } else {
      consola.error('Please input target repo with -t owner/repo');
      process.exitCode = 1;
    }
  });

program
  .command('skill')
  .description('Install the lobe-label skill for AI coding agents')
  .option('-g, --global', 'Install into the home directory instead of the current project')
  .addOption(
    new Option('--agent <agents...>', 'Agents to install for, detected by default').choices(
      skillAgents,
    ),
  )
  .action((flags: SkillFlags) => runSkillInstall('lobe-label', import.meta.url, flags));

program.parse();
