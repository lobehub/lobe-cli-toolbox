import { merge } from 'lodash-es';

import { DEFAULT_CONFIG } from '@/store/initialState';

import type { I18nConfig } from './types/config';

export type Config = I18nConfig;
export const defineConfig = (config: Partial<Config>): Config => {
  return merge(config, DEFAULT_CONFIG) as Config;
};
