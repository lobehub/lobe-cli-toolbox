import { Command, Option } from 'commander';
import { consola } from 'consola';
import updateNotifier from 'update-notifier';

import Shebang from '@/commands/Shebang';

import packageJson from '../package.json';

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
if (!options.target) {
  consola.error('Please input target file with -t <file>');
  process.exitCode = 1;
} else if (!Shebang(options.target, options.shebang)) {
  process.exitCode = 1;
}
