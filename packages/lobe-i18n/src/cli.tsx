import { render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import { Config, TranslateLocale, TranslateMarkdown } from '@/commands';
import { explorer } from '@/store/config';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

const program = new Command();

interface Flags {
  clear?: boolean;
  config?: string;
  option?: boolean;
  withMd?: boolean;
}

program
  .name('lobe-i18n')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-o, --option', 'Setup lobe-i18n preferences'))
  .addOption(new Option('-c, --config <string>', 'Specify the configuration file'))
  .addOption(new Option('--clear', 'clear cache'))
  .addOption(
    new Option('-m, --with-md', 'Run i18n translation and markdown translation simultaneously'),
  );

program.command('locale', { isDefault: true }).action(async () => {
  const options: Flags = program.opts();
  if (options.option) {
    render(<Config />);
  } else {
    if (options.config) explorer.loadCustomConfig(options.config);
    await new TranslateLocale().start();
    if (options.withMd) await new TranslateMarkdown().start();
  }
});

program.command('md').action(async () => {
  const options: Flags = program.opts();
  if (options.config) explorer.loadCustomConfig(options.config);
  const service = new TranslateMarkdown();
  if (options.clear) {
    await service.fileHashCache.clear();
  }
  await service.start();
});

program.parse();
