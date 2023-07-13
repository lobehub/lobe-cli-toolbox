import Conf from 'conf';

export interface Config {
  apiBaseUrl: string;
  diffChunkSize: number;
  emoji: 'emoji' | 'code';
  githubToken: string;
  locale: string;
  maxLength: number;
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

export const schema: ConfigSchema = {
  apiBaseUrl: {
    default: '',
    type: 'string',
  },
  diffChunkSize: {
    default: 5000,
    type: 'number',
  },
  emoji: {
    default: 'emoji',
    type: 'string',
  },
  githubToken: {
    default: '',
    type: 'string',
  },
  locale: {
    default: '',
    type: 'string',
  },
  maxLength: {
    default: 100,
    type: 'number',
  },
  openaiToken: {
    default: '',
    type: 'string',
  },
  prompt: {
    default: '',
    type: 'string',
  },
};

export const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});
export const getConfig = <K extends ConfigKeys>(key: K): Config[K] => config.get(key) as Config[K];
export const getDefulatConfig = <K extends ConfigKeys>(key: K) => schema[key].default as Config[K];
export const setConfig = <K extends ConfigKeys>(key: K, value: Config[K]) => config.set(key, value);

export const useConfStore = () => {
  const store = config.store as Config;
  return {
    get: getConfig,
    getDefault: getDefulatConfig,
    set: setConfig,
    store,
  };
};
