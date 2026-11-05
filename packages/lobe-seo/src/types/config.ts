export interface SeoConfig {
  /**
   * @description Number of concurrently pending promises returned
   */
  concurrency?: number;
  /**
   * @description Entry files path
   */
  entry: string[];
  /**
   * @description The entry file or folder, support glob
   */
  entryExtension: string;
  /**
   * @description Exclude files path
   */
  exclude: string[];
  experimental?: {
    jsonMode?: boolean;
  };
  /**
   * @description Set group key for SEO matters
   */
  groupKey?: string;
  /**
   * @description Model id to use, overrides the model chosen by `lobe-seo --option`
   */
  modelName?: string;
  /**
   * @description Provide some context for a more accurate translation
   */
  reference?: string;
  /**
   * @description Stringify the tags array
   */
  tagStringify?: boolean;
  /**
   * @description Sampling temperature to use
   */
  temperature?: number;
}

export type OptionKeys = keyof SeoConfig;

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
