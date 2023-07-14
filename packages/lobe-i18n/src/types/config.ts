export interface I18nConfig {
  /**
   * @description The entry file or folder
   */
  entry: string;
  /**
   * @description The language that will use as translation ref
   */
  entryLocale: string;
  /**
   * @description ChatGPT model name to use
   */
  modelName?: 'gpt-3.5-turbo' | 'gpt-3.5-turbo-16k' | 'gpt-4' | 'gpt-4-32k';
  /**
   * @description Where you store your locale files
   */
  output: string;
  /**
   * @description All languages that need to be translated
   */
  outputLocales: string[];
  /**
   * @description Provide some context for a more accurate translation
   */
  reference?: string;
  /**
   * @description Split locale JSON by token
   */
  splitToken?: number;
  /**
   * @description Sampling temperature to use
   */
  temperature?: 0;
}

export type OptionKeys = keyof I18nConfig;
