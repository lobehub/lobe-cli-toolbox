import Conf from 'conf';

const schema = {
  autoAdd: {
    type: 'boolean',
    default: true,
  },
  emojiFormat: {
    type: 'boolean',
    default: true,
  },
  gitmojisUrl: {
    type: 'string',
    format: 'url',
    default: 'https://lobehub.com',
  },
};

const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});

export default config;
