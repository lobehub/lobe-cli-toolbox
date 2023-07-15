import type { I18nConfig } from './types/config';

export type Config = I18nConfig;
export const defineConfig = (config: Config): Config => {
  return {
    splitToken: 2000,
    temperature: 0,
    ...config,
  };
};
