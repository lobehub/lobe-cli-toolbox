import { render } from 'ink';
import meow from 'meow';

import App from './commands';
import FLAGS_CONST from './constants/flags';
import createMeowSetting from './utils/createMeowSetting';

const { help, flags } = createMeowSetting(FLAGS_CONST);

const cli = meow(help, {
  flags,
  // @ts-ignore
  importMeta: import.meta,
});

// @ts-ignore
render(<App {...cli.flags} />);
