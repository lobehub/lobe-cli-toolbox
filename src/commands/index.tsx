import { Text } from 'ink';
import React from 'react';
import Commit from './Commit';
import List from './List';
import Update from './Update';
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
    return <Commit />;
  }
  if (props.config) {
    return <Text>config</Text>;
  }
  if (props.init) {
    return <Text>init</Text>;
  }
  if (props.remove) {
    return <Text>remove</Text>;
  }
  if (props.update) {
    return <Update />;
  }
  if (props.version) {
    return null;
  }
  return <Commit />;
};

export default App;
