import { render } from 'ink';
import meow from 'meow';
import App from './App';
import FLAGS_CONST from './constants/flags';
import createMeowSetting from './utils/createMeowSetting';

const { help, flags } = createMeowSetting(FLAGS_CONST);

const cli = meow(help, {
  importMeta: import.meta,
  flags,
});

render(<App {...cli.flags} />);
