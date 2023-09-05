import Conf from 'conf';

export interface Config {
  githubToken: string;
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
  githubToken: {
    default: '',
    type: 'string',
  },
};

export const config = new Conf({
  projectName: 'lobe-i18n',
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
