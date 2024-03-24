import { I18nConfig, MarkdownModeType } from '@/types/config';
import { getDefaultExtension } from '@/utils/getDefaultExtension';

import { defaultModel } from '../../../common/models';

export const DEFAULT_CONFIG: Partial<I18nConfig> = {
  concurrency: 5,
  markdown: {
    entry: [],
    mode: MarkdownModeType.STRING,
    outputExtensions: getDefaultExtension,
  },
  modelName: defaultModel,
  temperature: 0,
};
