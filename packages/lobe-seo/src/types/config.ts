import { LanguageModel } from './models';

export interface SeoConfig {
  /**
   * @description Number of concurrently pending promises returned
   */
  concurrency?: number;
  entry: string[];
  /**
   * @description The entry file or folder, support glob
   */
  entryExtension: string;
  exclude: string[];
  experimental?: {
    jsonMode?: boolean;
  };
  /**
   * @description ChatGPT model name to use
   */
  modelName?: LanguageModel;
  /**
   * @description Sampling temperature to use
   */
  temperature?: number;
}

export type OptionKeys = keyof SeoConfig;

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
