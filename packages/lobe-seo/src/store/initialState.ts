import { SeoConfig } from '@/types/config';

import { defaultModel } from '../../../common/models';

export const DEFAULT_CONFIG: Partial<SeoConfig> = {
  concurrency: 5,
  entryExtension: '.mdx',
  modelName: defaultModel,
  temperature: 0,
};
