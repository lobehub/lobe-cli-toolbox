import selectors from '@/store/selectors';
import type { Config } from '@/types/config';

import { config } from './config';

export const useConfStore = () => {
  const store = config.store as Config;
  return {
    get: selectors.getConfig,
    getDefault: selectors.getDefaultConfig,
    set: selectors.setConfig,
    store,
  };
};
