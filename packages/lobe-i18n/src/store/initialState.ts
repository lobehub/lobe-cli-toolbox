import { I18nConfig, MarkdownModeType } from '@/types/config';
import { LanguageModel } from '@/types/models';
import { getDefaultExtension } from '@/utils/getDefaultExtension';

export const DEFAULT_CONFIG: Partial<I18nConfig> = {
  concurrency: 5,
  markdown: {
    entry: [],
    mode: MarkdownModeType.STRING,
    outputExtensions: getDefaultExtension,
  },
  modelName: LanguageModel.GPT3_5,
  temperature: 0,
};
