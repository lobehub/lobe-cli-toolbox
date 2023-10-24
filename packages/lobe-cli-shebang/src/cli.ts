import { Command, Option } from 'commander';
import { consola } from 'consola';
import updateNotifier from 'update-notifier';

import packageJson from '@/../package.json';
import Shebang from '@/commands/Shebang';

const notifier = updateNotifier({
  pkg: packageJson,
  shouldNotifyInNpmScript: true,
});

notifier.notify({ isGlobal: true });

const program = new Command();

program
  .name('lobe-shebang')
  .description(packageJson.description)
  .version(packageJson.version)
  .addOption(new Option('-t, --target <file>', 'Target file'))
  .addOption(new Option('-s, --shebang <string>', 'Shebang'))
  .parse();

interface Flags {
  shebang?: string;
  target?: string;
}

const options: Flags = program.opts();
if (options.target) {
  Shebang(options.target, options.shebang);
} else {
  consola.error('Please input target file with -t <file>');
}
