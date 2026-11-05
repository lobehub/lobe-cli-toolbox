export interface Config {
  apiBaseUrl: string;
  apiType: string;
  /**
   * Diffs larger than this are summarized chunk by chunk
   */
  diffChunkTokens: number;
  emoji: 'emoji' | 'code';
  githubToken: string;
  includeWhy: boolean;
  locale: string;
  maxLength: number;
  messageTemplate: string;
  modelName: string;
  oneLineCommit: boolean;
  openaiToken: string;
  prompt: string;
  provider: string;
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
