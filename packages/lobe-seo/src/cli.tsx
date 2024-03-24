import { render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import { Config, Seo } from '@/commands';
import { explorer } from '@/store/config';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

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

program.parse();
