import selectors from './selectors';

export const useConfStore = () => {
  return {
    get: selectors.getConfig,
    getDefault: selectors.getDefulatConfig,
    set: selectors.setConfig,
    store: selectors.getCommitConfig(),
  };
};
