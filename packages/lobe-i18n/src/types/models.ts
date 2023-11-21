export enum LanguageModel {
  /**
   * GPT 3.5 Turbo
   */
  GPT3_5 = 'gpt-3.5-turbo',
  GPT3_5_1106 = 'gpt-3.5-turbo-1106',
  GPT3_5_16K = 'gpt-3.5-turbo-16k',
  /**
   * GPT 4
   */
  GPT4 = 'gpt-4',
  GPT4_32K = 'gpt-4-32k',
  GPT4_PREVIEW = 'gpt-4-1106-preview',
  GPT4_VISION_PREVIEW = 'gpt-4-vision-preview',
}

export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.GPT3_5]: 4096,
  [LanguageModel.GPT3_5_1106]: 16_385,
  [LanguageModel.GPT3_5_16K]: 16_385,
  [LanguageModel.GPT4]: 8196,
  [LanguageModel.GPT4_PREVIEW]: 128_000,
  [LanguageModel.GPT4_VISION_PREVIEW]: 128_000,
  [LanguageModel.GPT4_32K]: 32_768,
};
