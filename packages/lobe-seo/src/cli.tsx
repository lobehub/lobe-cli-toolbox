import { alert, render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import { Config, Seo } from '@/commands';
import { explorer, migrateConfig } from '@/store/config';

import { skillAgents } from '../../common/skill';
import { type SkillFlags, runSkillInstall } from '../../common/skillCommand';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

if (migrateConfig()) alert.info('Migrated the lobe-seo config to the latest format');

const program = new Command();

interface Flags {
  config?: string;
  option?: boolean;
  withMd?: boolean;
}

program
  .name('lobe-seo')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-o, --option', 'Setup lobe-seo preferences'))
  .addOption(new Option('-c, --config <string>', 'Specify the configuration file'));

program.command('locale', { isDefault: true }).action(async () => {
  const options: Flags = program.opts();
  if (options.option) {
    render(<Config />);
  } else {
    if (options.config) explorer.loadCustomConfig(options.config);
    await new Seo().start();
  }
});

program
  .command('skill')
  .description('Install the lobe-seo skill for AI coding agents')
  .option('-g, --global', 'Install into the home directory instead of the current project')
  .addOption(
    new Option('--agent <agents...>', 'Agents to install for, detected by default').choices(
      skillAgents,
    ),
  )
  .action((flags: SkillFlags) => runSkillInstall('lobe-seo', import.meta.url, flags));

program.parse();
