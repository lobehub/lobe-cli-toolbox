// refs: https://github.com/lobehub/lobe-chat/blob/main/src/config/modelProviders/openai.ts
// Auto-generated file. Do not edit manually.
// Last updated: 2025-05-27T03:49:33.481Z

export enum LanguageModel {
  /**
   * ChatGPT-4o
   */
  CHATGPT_4O_LATEST = 'chatgpt-4o-latest',
  /**
   * GPT-3.5 Turbo
   */
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  /**
   * GPT-3.5 Turbo 0125
   */
  GPT_3_5_TURBO_0125 = 'gpt-3.5-turbo-0125',
  /**
   * GPT-3.5 Turbo 1106
   */
  GPT_3_5_TURBO_1106 = 'gpt-3.5-turbo-1106',
  /**
   * GPT-4
   */
  GPT_4 = 'gpt-4',
  /**
   * GPT-4o
   */
  GPT_4O = 'gpt-4o',
  /**
   * GPT-4o 0513
   */
  GPT_4O_2024_05_13 = 'gpt-4o-2024-05-13',
  /**
   * GPT-4o 1120
   */
  GPT_4O_2024_11_20 = 'gpt-4o-2024-11-20',
  /**
   * GPT-4o mini
   */
  GPT_4O_MINI = 'gpt-4o-mini',
  /**
   * GPT-4 Turbo Preview 0125
   */
  GPT_4_0125_PREVIEW = 'gpt-4-0125-preview',
  /**
   * GPT-4 0613
   */
  GPT_4_0613 = 'gpt-4-0613',
  /**
   * GPT-4.1
   */
  GPT_4_1 = 'gpt-4.1',
  /**
   * GPT-4 Turbo Preview 1106
   */
  GPT_4_1106_PREVIEW = 'gpt-4-1106-preview',
  /**
   * GPT-4.1 mini
   */
  GPT_4_1_MINI = 'gpt-4.1-mini',
  /**
   * GPT-4.1 nano
   */
  GPT_4_1_NANO = 'gpt-4.1-nano',
  /**
   * GPT-4 32K
   */
  GPT_4_32K = 'gpt-4-32k',
  /**
   * GPT-4.5 Preview
   */
  GPT_4_5_PREVIEW = 'gpt-4.5-preview',
  /**
   * GPT-4 Turbo
   */
  GPT_4_TURBO = 'gpt-4-turbo',
  /**
   * GPT-4 Turbo Vision 0409
   */
  GPT_4_TURBO_2024_04_09 = 'gpt-4-turbo-2024-04-09',
  /**
   * GPT-4 Turbo Preview
   */
  GPT_4_TURBO_PREVIEW = 'gpt-4-turbo-preview',
  /**
   * o1
   */
  O1 = 'o1',
  /**
   * o1-mini
   */
  O1_MINI = 'o1-mini',
  /**
   * o1-preview
   */
  O1_PREVIEW = 'o1-preview',
  /**
   * o3
   */
  O3 = 'o3',
  /**
   * o3-mini
   */
  O3_MINI = 'o3-mini',
  /**
   * o4-mini
   */
  O4_MINI = 'o4-mini',
}

export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.O3]: 200_000,
  [LanguageModel.O4_MINI]: 200_000,
  [LanguageModel.GPT_4_1]: 1_047_576,
  [LanguageModel.GPT_4_1_MINI]: 1_047_576,
  [LanguageModel.GPT_4_1_NANO]: 1_047_576,
  [LanguageModel.O3_MINI]: 200_000,
  [LanguageModel.O1_MINI]: 128_000,
  [LanguageModel.O1]: 200_000,
  [LanguageModel.O1_PREVIEW]: 128_000,
  [LanguageModel.GPT_4_5_PREVIEW]: 128_000,
  [LanguageModel.GPT_4O_MINI]: 128_000,
  [LanguageModel.GPT_4O_2024_11_20]: 128_000,
  [LanguageModel.GPT_4O]: 128_000,
  [LanguageModel.GPT_4O_2024_05_13]: 128_000,
  [LanguageModel.CHATGPT_4O_LATEST]: 128_000,
  [LanguageModel.GPT_4_TURBO]: 128_000,
  [LanguageModel.GPT_4_TURBO_2024_04_09]: 128_000,
  [LanguageModel.GPT_4_TURBO_PREVIEW]: 128_000,
  [LanguageModel.GPT_4_0125_PREVIEW]: 128_000,
  [LanguageModel.GPT_4_1106_PREVIEW]: 128_000,
  [LanguageModel.GPT_4]: 8192,
  [LanguageModel.GPT_4_0613]: 8192,
  [LanguageModel.GPT_4_32K]: 32_768,
  [LanguageModel.GPT_3_5_TURBO]: 16_384,
  [LanguageModel.GPT_3_5_TURBO_0125]: 16_384,
  [LanguageModel.GPT_3_5_TURBO_1106]: 16_384,
};

export const defaultModel = LanguageModel.O4_MINI;
