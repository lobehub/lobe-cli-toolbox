import Conf from 'conf';

import { ConfigSchema } from '@/types/config';

import { ModelTokens, defaultModel } from '../../../common/models';

export const schema: ConfigSchema = {
  apiBaseUrl: {
    default: '',
    type: 'string',
  },
  diffChunkSize: {
    default: ModelTokens[defaultModel] - 512,
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
  includeWhy: {
    default: false,
    type: 'boolean',
  },
  locale: {
    default: '',
    type: 'string',
  },
  maxLength: {
    default: 100,
    type: 'number',
  },
  messageTemplate: {
    default: '$msg',
    type: 'string',
  },
  modelName: {
    default: defaultModel,
    type: 'string',
  },
  oneLineCommit: {
    default: false,
    type: 'boolean',
  },
  openaiToken: {
    default: '',
    type: 'string',
  },
  prompt: {
    default: '',
    type: 'string',
  },
  stream: {
    default: true,
    type: 'boolean',
  },
  useFullGitmoji: {
    default: false,
    type: 'boolean',
  },
};

export const config = new Conf({
  projectName: 'lobe-commit',
  schema,
});
