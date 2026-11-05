import { alert, render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import { Config, Lint, TranslateLocale, TranslateMarkdown } from '@/commands';
import { explorer, migrateConfig } from '@/store/config';

import { skillAgents } from '../../common/skill';
import { type SkillFlags, runSkillInstall } from '../../common/skillCommand';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

if (migrateConfig()) alert.info('Migrated the lobe-i18n config to the latest format');

const program = new Command();

interface Flags {
  config?: string;
  force?: boolean;
  lint?: boolean;
  option?: boolean;
  quiet?: boolean;
  withMd?: boolean;
}

program
  .name('lobe-i18n')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-o, --option', 'Setup lobe-i18n preferences'))
  .addOption(new Option('-c, --config <string>', 'Specify the configuration file'))
  .addOption(
    new Option('-m, --with-md', 'Run i18n translation and markdown translation simultaneously'),
  )
  .addOption(new Option('--force', 'Ignore the markdown cache and retranslate all markdown files'))
  .addOption(new Option('--lint', 'Lint translation files for language correctness'))
  .addOption(new Option('--quiet', 'Only show errors, suppress warnings'));

program.command('locale', { isDefault: true }).action(async () => {
  const options: Flags = program.opts();
  if (options.option) {
    render(<Config />);
  } else if (options.lint) {
    if (options.config) explorer.loadCustomConfig(options.config);
    await new Lint().start(options.quiet);
  } else {
    if (options.config) explorer.loadCustomConfig(options.config);
    await new TranslateLocale().start();
    if (options.withMd) await new TranslateMarkdown({ force: options.force }).start();
  }
});

program.command('md').action(async () => {
  const options: Flags = program.opts();
  if (options.config) explorer.loadCustomConfig(options.config);
  await new TranslateMarkdown({ force: options.force }).start();
});

program.command('lint').action(async () => {
  const options: Flags = program.opts();
  if (options.config) explorer.loadCustomConfig(options.config);
  await new Lint().start(options.quiet);
});

program
  .command('skill')
  .description('Install the lobe-i18n skill for AI coding agents')
  .option('-g, --global', 'Install into the home directory instead of the current project')
  .addOption(
    new Option('--agent <agents...>', 'Agents to install for, detected by default').choices(
      skillAgents,
    ),
  )
  .action((flags: SkillFlags) => runSkillInstall('lobe-i18n', import.meta.url, flags));

program.parse();
