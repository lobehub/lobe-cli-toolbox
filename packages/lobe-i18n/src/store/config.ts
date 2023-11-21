import Conf from 'conf';
import { cosmiconfigSync } from 'cosmiconfig';

import { ConfigSchema } from '@/types/config';

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

export const explorer = cosmiconfigSync('i18n');
