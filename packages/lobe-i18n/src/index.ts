import { merge } from 'lodash-es';

import type { I18nConfig } from './types/config';
import { LanguageModel } from './types/models';

export type Config = I18nConfig;
export const defineConfig = (config: Partial<Config>): Config => {
  return merge(config, {
    markdown: {
      mode: 'string',
    },
    modelName: LanguageModel.GPT3_5,
    temperature: 0,
  } as Partial<Config>) as Config;
};
