import { LanguageModel } from '../../../common/models';

export interface Config {
  apiBaseUrl: string;
  diffChunkSize: number;
  emoji: 'emoji' | 'code';
  githubToken: string;
  locale: string;
  maxLength: number;
  modelName: LanguageModel;
  openaiToken: string;
  prompt: string;
}

export type ConfigKeys = keyof Config;

export interface ConfigSchemaItem {
  default: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export type ConfigSchema = {
  [key in ConfigKeys]: ConfigSchemaItem;
};
