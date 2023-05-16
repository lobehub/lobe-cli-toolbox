import { Text } from 'ink';
import React from 'react';
import Commit from './Commit';
import List from './List';
import Update from './Update';
interface AppProps {
  list: boolean;
  commit: boolean;
  config: boolean;
  help: boolean;
  init: boolean;
  remove: boolean;
  update: boolean;
  version: boolean;
  hook: boolean;
}

const App: React.FC<AppProps> = (props) => {
  if (props.list) {
    return <List />;
  } else if (props.commit) {
    return <Commit />;
  } else if (props.config) {
    return <Text>config</Text>;
  } else if (props.init) {
    return <Text>init</Text>;
  } else if (props.remove) {
    return <Text>remove</Text>;
  } else if (props.update) {
    return <Update />;
  } else if (props.version) {
    return null;
  } else if (props.hook) {
    return <Commit hook />;
  }
  return <Commit />;
};

export default App;
