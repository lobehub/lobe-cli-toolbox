import { render } from 'ink';
import meow from 'meow';
// @ts-ignore
import updateNotifier from 'update-notifier';
import packageJson from '../package.json';
import App from './commands';
import FLAGS_CONST from './constants/flags';
import createMeowSetting from './utils/createMeowSetting';

const notifier = updateNotifier({ pkg: packageJson });

const { help, flags } = createMeowSetting(FLAGS_CONST);

const cli = meow(help, {
  // @ts-ignore
  importMeta: import.meta,
  flags,
});

// @ts-ignore
render(<App {...cli.flags} />);

notifier.notify();
