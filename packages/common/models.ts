// refs: https://github.com/lobehub/lobe-chat/blob/main/src/config/modelProviders/openai.ts
// Auto-generated file. Do not edit manually.
// Last updated: 2025-12-25T04:17:46.914Z

export enum LanguageModel {
  /**
   * ChatGPT-4o
   */
  CHATGPT_4O_LATEST = 'chatgpt-4o-latest',
  /**
   * Codex mini
   */
  CODEX_MINI_LATEST = 'codex-mini-latest',
  /**
   * Computer Use Preview
   */
  COMPUTER_USE_PREVIEW = 'computer-use-preview',
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
   * GPT-4o Audio Preview
   */
  GPT_4O_AUDIO_PREVIEW = 'gpt-4o-audio-preview',
  /**
   * GPT-4o mini
   */
  GPT_4O_MINI = 'gpt-4o-mini',
  /**
   * GPT-4o mini Audio
   */
  GPT_4O_MINI_AUDIO_PREVIEW = 'gpt-4o-mini-audio-preview',
  /**
   * GPT-4o mini Search Preview
   */
  GPT_4O_MINI_SEARCH_PREVIEW = 'gpt-4o-mini-search-preview',
  /**
   * GPT-4o Search Preview
   */
  GPT_4O_SEARCH_PREVIEW = 'gpt-4o-search-preview',
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
   * GPT-5
   */
  GPT_5 = 'gpt-5',
  /**
   * GPT-5.1
   */
  GPT_5_1 = 'gpt-5.1',
  /**
   * GPT-5.1 Chat
   */
  GPT_5_1_CHAT_LATEST = 'gpt-5.1-chat-latest',
  /**
   * GPT-5.1 Codex
   */
  GPT_5_1_CODEX = 'gpt-5.1-codex',
  /**
   * GPT-5.1 Codex mini
   */
  GPT_5_1_CODEX_MINI = 'gpt-5.1-codex-mini',
  /**
   * GPT-5.2
   */
  GPT_5_2 = 'gpt-5.2',
  /**
   * GPT-5.2 Chat
   */
  GPT_5_2_CHAT_LATEST = 'gpt-5.2-chat-latest',
  /**
   * GPT-5.2 pro
   */
  GPT_5_2_PRO = 'gpt-5.2-pro',
  /**
   * GPT-5 Chat
   */
  GPT_5_CHAT_LATEST = 'gpt-5-chat-latest',
  /**
   * GPT-5 Codex
   */
  GPT_5_CODEX = 'gpt-5-codex',
  /**
   * GPT-5 mini
   */
  GPT_5_MINI = 'gpt-5-mini',
  /**
   * GPT-5 nano
   */
  GPT_5_NANO = 'gpt-5-nano',
  /**
   * GPT-5 pro
   */
  GPT_5_PRO = 'gpt-5-pro',
  /**
   * GPT Audio
   */
  GPT_AUDIO = 'gpt-audio',
  /**
   * o1
   */
  O1 = 'o1',
  /**
   * o1-pro
   */
  O1_PRO = 'o1-pro',
  /**
   * o3
   */
  O3 = 'o3',
  /**
   * o3 Deep Research
   */
  O3_DEEP_RESEARCH = 'o3-deep-research',
  /**
   * o3-mini
   */
  O3_MINI = 'o3-mini',
  /**
   * o3-pro
   */
  O3_PRO = 'o3-pro',
  /**
   * o4-mini
   */
  O4_MINI = 'o4-mini',
  /**
   * o4-mini Deep Research
   */
  O4_MINI_DEEP_RESEARCH = 'o4-mini-deep-research',
}

export const ModelTokens: Record<LanguageModel, number> = {
  [LanguageModel.GPT_5_2]: 400_000,
  [LanguageModel.GPT_5_2_PRO]: 400_000,
  [LanguageModel.GPT_5_2_CHAT_LATEST]: 128_000,
  [LanguageModel.GPT_5_1]: 400_000,
  [LanguageModel.GPT_5_1_CHAT_LATEST]: 128_000,
  [LanguageModel.GPT_5_1_CODEX]: 400_000,
  [LanguageModel.GPT_5_1_CODEX_MINI]: 400_000,
  [LanguageModel.GPT_5_PRO]: 400_000,
  [LanguageModel.GPT_5_CODEX]: 400_000,
  [LanguageModel.GPT_5]: 400_000,
  [LanguageModel.GPT_5_MINI]: 400_000,
  [LanguageModel.GPT_5_NANO]: 400_000,
  [LanguageModel.GPT_5_CHAT_LATEST]: 400_000,
  [LanguageModel.O4_MINI]: 200_000,
  [LanguageModel.O4_MINI_DEEP_RESEARCH]: 200_000,
  [LanguageModel.O3_PRO]: 200_000,
  [LanguageModel.O3]: 200_000,
  [LanguageModel.O3_DEEP_RESEARCH]: 200_000,
  [LanguageModel.O3_MINI]: 200_000,
  [LanguageModel.O1_PRO]: 200_000,
  [LanguageModel.O1]: 200_000,
  [LanguageModel.GPT_4_1]: 1_047_576,
  [LanguageModel.GPT_4_1_MINI]: 1_047_576,
  [LanguageModel.GPT_4_1_NANO]: 1_047_576,
  [LanguageModel.GPT_4O_MINI]: 128_000,
  [LanguageModel.GPT_4O_MINI_SEARCH_PREVIEW]: 128_000,
  [LanguageModel.GPT_4O]: 128_000,
  [LanguageModel.GPT_4O_SEARCH_PREVIEW]: 128_000,
  [LanguageModel.GPT_4O_2024_11_20]: 128_000,
  [LanguageModel.GPT_4O_2024_05_13]: 128_000,
  [LanguageModel.GPT_AUDIO]: 128_000,
  [LanguageModel.GPT_4O_AUDIO_PREVIEW]: 128_000,
  [LanguageModel.GPT_4O_MINI_AUDIO_PREVIEW]: 128_000,
  [LanguageModel.CHATGPT_4O_LATEST]: 128_000,
  [LanguageModel.GPT_4_TURBO]: 128_000,
  [LanguageModel.GPT_4_TURBO_2024_04_09]: 128_000,
  [LanguageModel.GPT_4_TURBO_PREVIEW]: 128_000,
  [LanguageModel.GPT_4_0125_PREVIEW]: 128_000,
  [LanguageModel.GPT_4_1106_PREVIEW]: 128_000,
  [LanguageModel.GPT_4]: 8192,
  [LanguageModel.GPT_4_0613]: 8192,
  [LanguageModel.GPT_3_5_TURBO]: 16_384,
  [LanguageModel.GPT_3_5_TURBO_0125]: 16_384,
  [LanguageModel.GPT_3_5_TURBO_1106]: 16_384,
  [LanguageModel.CODEX_MINI_LATEST]: 200_000,
  [LanguageModel.COMPUTER_USE_PREVIEW]: 8192,
};

export const defaultModel = LanguageModel.GPT_5_MINI;
