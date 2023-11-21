import Conf from 'conf';
import dotenv from 'dotenv';

import { Config, ConfigKeys, ConfigSchema } from '@/types/config';

dotenv.config();
export const schema: ConfigSchema = {
  apiBaseUrl: {
    default: '',
    type: 'string',
  },
  openaiToken: {
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
export const getOpenAIApiKey = () => process.env.OPENAI_API_KEYL || getConfig('openaiToken');
export const getOpenAIProxyUrl = () => process.env.OPENAI_PROXY_URL || getConfig('apiBaseUrl');

export const useConfStore = () => {
  const store = config.store as Config;
  return {
    get: getConfig,
    getDefault: getDefulatConfig,
    set: setConfig,
    store,
  };
};

export { getConfigFile as getTranslateConfig } from './getConfigFile';
export { Config, ConfigKeys, ConfigSchema } from '@/types/config';
