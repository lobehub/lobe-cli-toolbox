import { render } from 'ink';
import meow from 'meow';
import App from './App';
import FLAGS_CONST from './constants/flags';
import createMeowSetting from './utils/createMeowSetting';

const { help, flags } = createMeowSetting(FLAGS_CONST);

const cli = meow(help, {
  // @ts-ignore
  importMeta: import.meta,
  flags,
});

// @ts-ignore
render(<App {...cli.flags} />);
