import { SeoConfig } from '@/types/config';
import { LanguageModel } from '@/types/models';

export const DEFAULT_CONFIG: Partial<SeoConfig> = {
  concurrency: 5,
  entryExtension: '.mdx',
  modelName: LanguageModel.GPT3_5,
  temperature: 0,
};
