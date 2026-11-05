export type KeyStyle = 'auto' | 'flat' | 'nested';

/**
 * Term → translation. A string applies to every locale (e.g. `{ LobeHub: 'LobeHub' }` keeps a
 * brand name), an object sets the translation per locale.
 */
export type Glossary = Record<string, string | Record<string, string>>;

export interface I18nConfigLocale {
  /**
   * @description Maximum number of parallel LLM requests, shared across all files and locales
   * @default 5
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
   * @description Terms that must always be translated the same way; only the terms found in a
   * chunk are sent to the model
   */
  glossary?: Glossary;
  /**
   * @description How to resolve dot-delimited keys when building diff entries
   * @default 'nested'
   */
  keyStyle?: KeyStyle;
  /**
   * @description Model id to use, overrides the model chosen by `lobe-i18n --option`
   */
  modelName?: string;
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
   * @description Number of existing translations of the target file sent with each chunk as
   * terminology and style examples, `0` disables it
   * @default 20
   */
  referenceExamples?: number;
  /**
   * @description Save translation results immediately after each chunk is completed
   * @default true
   */
  saveImmediately?: boolean;
  /**
   * @description Split locale JSON / markdown into chunks of this many tokens
   * @default 4000
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
   * @description Where to store source hashes used to detect changed markdown files
   * @default '.i18n-cache.json'
   */
  cacheFile?: string;
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
   * @description Front matter keys to translate when `includeMatter` is off, e.g.
   * `['title', 'description']`; other keys are copied from the source
   */
  matterKeys?: string[];
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

export interface InlineConfig {
  /**
   * @description Keys whose values are identifiers rather than text (e.g. `id`, `kind`), they
   * are copied from the entry locale instead of translated
   */
  copyKeys?: string[];
  /**
   * @description JSON files that keep every locale in the same file, support glob
   */
  entry: string[];
  /**
   * @description The files that will ignore, support glob
   */
  exclude?: string[];
}

export interface I18nConfig extends I18nConfigLocale {
  experimental?: {
    jsonMode?: boolean;
  };
  /**
   * @description Translate JSON files that keep every locale side by side, such as
   * `{ "en": {…}, "zh": {…} }` or `{ "name": { "en": "…", "zh": "…" } }` at any depth
   */
  inline?: InlineConfig;
  markdown?: MarkdownConfig;
}

export type OptionKeys = keyof I18nConfig;

export interface Config {
  apiBaseUrl: string;
  apiType: string;
  modelName: string;
  openaiToken: string;
  provider: string;
}

export type ConfigKeys = keyof Config;

export interface ConfigSchemaItem {
  default: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export type ConfigSchema = {
  [key in ConfigKeys]: ConfigSchemaItem;
};
