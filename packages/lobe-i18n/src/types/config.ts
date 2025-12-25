import { LanguageModel } from '../../../common/models';

export type KeyStyle = 'auto' | 'flat' | 'nested';

export interface I18nConfigLocale {
  /**
   * @description Number of concurrently pending promises returned
   */
  concurrency?: number;
  /**
   * @description The entry file or folder
   */
  entry: string;
  /**
   * @description The language that will use as translation ref
   */
  entryLocale: string;
  /**
   * @description How to resolve dot-delimited keys when building diff entries
   * @default 'nested'
   */
  keyStyle?: KeyStyle;
  /**
   * @description ChatGPT model name to use
   */
  modelName?: LanguageModel;
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
   * @description Save translation results immediately after each chunk is completed
   * @default false
   */
  saveImmediately?: boolean;
  /**
   * @description Split locale JSON by token
   */
  splitToken?: number;
  /**
   * @description Sampling temperature to use
   */
  temperature?: number;
  /**
   * @description Nucleus sampling threshold
   */
  topP?: number;
}

export enum MarkdownModeType {
  MDAST = 'mdast',
  STRING = 'string',
}

export type MarkdownMode = MarkdownModeType;
export type MarkdownModeFunction = (config: {
  fileContent: string;
  filePath: string;
}) => MarkdownModeType;

export interface MarkdownConfig {
  /**
   * @description The entry file or folder, support glob
   */
  entry: string[];
  /**
   * @description Markdown extension
   */
  entryExtension?: string;
  /**
   * @description The language that will use as translation ref
   */
  entryLocale?: string;
  /**
   * @description The markdown that will ignore, support glob
   */
  exclude?: string[];
  /**
   * @description Whether to include matter in the translation
   */
  includeMatter?: boolean;
  /**
   * @description Markdown translate mode
   */
  mode?: MarkdownMode | MarkdownModeFunction;
  /**
   * @description Markdown extension generator function
   */
  outputExtensions?: (
    locale: string,
    config: {
      fileContent: string;
      filePath: string;
      getDefaultExtension: (locale: string) => string;
    },
  ) => string;
  /**
   * @description All languages that need to be translated
   */
  outputLocales?: string[];
  /**
   * @description In Mdast mode, whether to translate code block
   */
  translateCode?: boolean;
}

export interface I18nConfig extends I18nConfigLocale {
  experimental?: {
    jsonMode?: boolean;
  };
  markdown?: MarkdownConfig;
}

export type OptionKeys = keyof I18nConfig;

export interface Config {
  apiBaseUrl: string;
  openaiToken: string;
}

export type ConfigKeys = keyof Config;

export interface ConfigSchemaItem {
  default: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export type ConfigSchema = {
  [key in ConfigKeys]: ConfigSchemaItem;
};
