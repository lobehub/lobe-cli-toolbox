import { I18nConfig } from '@/types/config';

export const defineConfig = (config: I18nConfig): I18nConfig => {
  return {
    splitToken: 2000,
    temperature: 0,
    ...config,
  };
};
