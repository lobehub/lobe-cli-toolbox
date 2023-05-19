import React, { useEffect } from 'react';
import Ai from './Ai';
import Commit from './Commit';
import Config from './Config';
import HookCreate from './Hook/HookCreate';
import HookRemove from './Hook/HookRemove';
import List from './List';
// @ts-ignore
import updateNotifier from 'update-notifier';
import packageJson from '../../package.json';

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
  ai: boolean;
}

const App: React.FC<AppProps> = (props) => {
  useEffect(() => {
    const notifier = updateNotifier({ pkg: packageJson });
    notifier.notify();
  }, []);

  if (props.list) {
    return <List />;
  } else if (props.commit) {
    return <Commit />;
  } else if (props.config) {
    return <Config />;
  } else if (props.init) {
    return <HookCreate />;
  } else if (props.remove) {
    return <HookRemove />;
  } else if (props.version) {
    return null;
  } else if (props.hook) {
    return <Commit hook />;
  } else if (props.ai) {
    return <Ai />;
  }
  return <Commit />;
};

export default App;
