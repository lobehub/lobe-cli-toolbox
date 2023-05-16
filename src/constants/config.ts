import Conf from 'conf';

const schema = {
  emojiFormat: {
    type: 'boolean',
    default: true,
  },
  openaiToken: {
    type: 'string',
    default: '',
  },
  githubToken: {
    type: 'string',
    default: '',
  },
};

const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});

export default config;
