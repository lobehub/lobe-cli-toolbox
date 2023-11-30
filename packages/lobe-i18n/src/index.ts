import type { I18nConfig } from './types/config';

export type Config = I18nConfig;
export const defineConfig = (config: Partial<Config>): Config => {
  return config as Config;
};
