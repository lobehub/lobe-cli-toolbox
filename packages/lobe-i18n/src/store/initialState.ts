import { I18nConfig, MarkdownModeType } from '@/types/config';
import { getDefaultExtension } from '@/utils/getDefaultExtension';

export const DEFAULT_CONFIG: Partial<I18nConfig> = {
  concurrency: 5,
  markdown: {
    entry: [],
    mode: MarkdownModeType.STRING,
    outputExtensions: getDefaultExtension,
  },
  saveImmediately: true,
  temperature: 0,
};
