import { render } from '@lobehub/cli-ui';
import { Command, Option } from 'commander';
import { consola } from 'consola';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import Config from '@/commands/Config';
import Copy from '@/commands/Copy';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

const program = new Command();

program
  .name('lobe-label')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-o, --config', 'Setup lobe-label preferences'))
  .addOption(new Option('-t, --target <repo>', 'Target repo'))
  .addOption(
    new Option('-s, --source <repo>', 'Source repo').default('canisminor1990/canisminor-template'),
  )
  .parse();

interface Flags {
  config?: boolean;
  source: string;
  target?: string;
}

const options: Flags = program.opts();
if (options.config) {
  render(<Config />);
} else if (options.target) {
  Copy(options.target, options.source);
} else {
  consola.error('Please input target repo with -t owner/repo');
}
