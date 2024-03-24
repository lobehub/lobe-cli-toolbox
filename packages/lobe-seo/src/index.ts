import type { SeoConfig } from './types/config';

export type Config = SeoConfig;
export const defineConfig = (config: Partial<Config>): Config => {
  return config as Config;
};
