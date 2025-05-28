import { LanguageModel } from '../../../common/models';

export interface Config {
  apiBaseUrl: string;
  diffChunkSize: number;
  emoji: 'emoji' | 'code';
  githubToken: string;
  includeWhy: boolean;
  locale: string;
  maxLength: number;
  messageTemplate: string;
  modelName: LanguageModel;
  oneLineCommit: boolean;
  openaiToken: string;
  prompt: string;
  stream: boolean;
  useFullGitmoji: boolean;
}

export type ConfigKeys = keyof Config;

export interface ConfigSchemaItem {
  default: string | number | boolean;
  type: 'string' | 'number' | 'boolean';
}

export type ConfigSchema = {
  [key in ConfigKeys]: ConfigSchemaItem;
};
