import Conf from 'conf';

export const CONFIG_NAME = {
  API_BASE_URL: 'apiBaseUrl',
  DIFF_LENGTH: 'diffLength',
  EMOJI_FORMAT: 'emojiFormat',
  GITHUB_TOKEN: 'githubToken',
  LOCALE: 'locale',
  MAX_LENGTH: 'maxLength',
  OPENAI_TOKEN: 'openaiToken',
  PROMPT: 'prompt',
  TIMEOUT: 'timeout',
};

const schema = {
  [CONFIG_NAME.EMOJI_FORMAT]: {
    default: true,
    type: 'boolean',
  },
  [CONFIG_NAME.OPENAI_TOKEN]: {
    default: '',
    type: 'string',
  },
  [CONFIG_NAME.API_BASE_URL]: {
    default: '',
    type: 'string',
  },
  [CONFIG_NAME.GITHUB_TOKEN]: {
    default: '',
    type: 'string',
  },
  [CONFIG_NAME.PROMPT]: {
    default: '',
    type: 'string',
  },
  [CONFIG_NAME.LOCALE]: {
    default: '',
    type: 'string',
  },
  [CONFIG_NAME.MAX_LENGTH]: {
    default: 100,
    type: 'number',
  },
  [CONFIG_NAME.TIMEOUT]: {
    default: 10_000,
    type: 'number',
  },
  [CONFIG_NAME.DIFF_LENGTH]: {
    default: 5000,
    type: 'number',
  },
};

const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});

export default config;
