import { Text } from 'ink';
import React from 'react';
import { List } from './commands';

interface AppProps {
  list: true;
  commit: false;
  config: false;
  help: false;
  init: false;
  remove: false;
  update: false;
  version: false;
}

const App: React.FC<AppProps> = (props) => {
  if (props.list) {
    return <List />;
  }
  if (props.commit) {
    return <Text>222</Text>;
  }
  if (props.config) {
    return <Text>333</Text>;
  }
  if (props.init) {
    return <Text>444</Text>;
  }
  if (props.remove) {
    return <Text>555</Text>;
  }
  if (props.update) {
    return <Text>666</Text>;
  }
  if (props.version) {
    return <Text>777</Text>;
  }
  return <Text>888</Text>;
};

export default App;
