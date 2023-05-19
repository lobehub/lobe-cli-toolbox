import Conf from 'conf';

export const CONFIG_NAME = {
  EMOJI_FORMAT: 'emojiFormat',
  PROMPT: 'prompt',
  OPENAI_TOKEN: 'openaiToken',
  API_BASE_URL: 'apiBaseUrl',
  GITHUB_TOKEN: 'githubToken',
};

const schema = {
  [CONFIG_NAME.EMOJI_FORMAT]: {
    type: 'boolean',
    default: true,
  },
  [CONFIG_NAME.OPENAI_TOKEN]: {
    type: 'string',
    default: '',
  },
  [CONFIG_NAME.API_BASE_URL]: {
    type: 'string',
    default: '',
  },
  [CONFIG_NAME.GITHUB_TOKEN]: {
    type: 'string',
    default: '',
  },
  [CONFIG_NAME.PROMPT]: {
    type: 'string',
    default: '',
  },
};

const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});

export default config;
