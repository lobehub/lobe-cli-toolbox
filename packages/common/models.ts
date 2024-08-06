// refs: https://github.com/lobehub/lobe-chat/blob/main/src/config/modelProviders/openai.ts

export enum LanguageModel {
  /**
   * GPT 3.5 Turbo
   */
  GPT3_5 = 'gpt-3.5-turbo',
  GPT3_5_0125 = 'gpt-3.5-turbo-0125',
  GPT3_5_1106 = 'gpt-3.5-turbo-1106',
  GPT3_5_16K = 'gpt-3.5-turbo-16k',
  /**
   * GPT 4
   */
  GPT4 = 'gpt-4',
  GPT4_0613 = 'gpt-4-0613',
  GPT4_32K = 'gpt-4-32k',
  GPT4_PREVIEW = 'gpt-4-0125-preview',
  GPT4_TURBO = 'gpt-4-turbo',
  GPT4_TURBO_1106 = 'gpt-4-1106-preview',
  GPT4_TURBO_1106_VISION = 'gpt-4-1106-vision-preview',
  GPT4_TURBO_2024_05_13 = 'gpt-4o-2024-05-13',
  GPT4_TURBO_2024_07_18 = 'gpt-4o-mini',
  GPT4_TURBO_PREVIEW = 'gpt-4-turbo-preview',
  GPT4_TURBO_VISION = 'gpt-4-turbo-vision',
  GPT4_VISION_PREVIEW = 'gpt-4-vision-preview',
}

export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.GPT3_5]: 16_385,
  [LanguageModel.GPT3_5_0125]: 16_385,
  [LanguageModel.GPT3_5_1106]: 16_385,
  [LanguageModel.GPT3_5_16K]: 16_385,
  [LanguageModel.GPT4]: 8192,
  [LanguageModel.GPT4_0613]: 8192,
  [LanguageModel.GPT4_32K]: 32_768,
  [LanguageModel.GPT4_PREVIEW]: 128_000,
  [LanguageModel.GPT4_VISION_PREVIEW]: 128_000,
  [LanguageModel.GPT4_TURBO]: 128_000,
  [LanguageModel.GPT4_TURBO_VISION]: 128_000,
  [LanguageModel.GPT4_TURBO_PREVIEW]: 128_000,
  [LanguageModel.GPT4_TURBO_1106_VISION]: 128_000,
  [LanguageModel.GPT4_TURBO_1106]: 128_000,
  [LanguageModel.GPT4_TURBO_2024_05_13]: 128_000,
  [LanguageModel.GPT4_TURBO_2024_07_18]: 16_385,
};

export const defaultModel = LanguageModel.GPT4_TURBO_2024_07_18;
