import selectors from '@/store/selectors';
import { Config } from '@/types/config';

import { config } from './config';

export const useConfStore = () => {
  const store = config.store as Config;
  return {
    get: selectors.getConfig,
    getDefault: selectors.getDefulatConfig,
    set: selectors.setConfig,
    store,
  };
};
