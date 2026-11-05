import selectors from './selectors';

export const useConfStore = () => {
  return {
    get: selectors.getConfig,
    getDefault: selectors.getDefaultConfig,
    set: selectors.setConfig,
    store: selectors.getCommitConfig(),
  };
};
