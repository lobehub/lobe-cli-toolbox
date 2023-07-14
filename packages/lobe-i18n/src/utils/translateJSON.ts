import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { HumanMessage, SystemMessage } from 'langchain/schema';

import { getConfig } from '@/store/confStore';
import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

const basePath = getConfig('apiBaseUrl');
const openAIApiKey = getConfig('openaiToken');
let model: ChatOpenAI;

export interface translateJSONProps {
  config: I18nConfig;
  from: string;
  json: LocaleObj;
  to: string;
}

export const translateJSON = async ({
  config,
  from,
  json,
  to,
}: translateJSONProps): Promise<LocaleObj> => {
  if (!openAIApiKey) {
    alert.error(`Please set the OpenAI Token by ${chalk.bold.yellow('lobe-i18n --config')}`, true);
  }
  if (!model) {
    model = new ChatOpenAI(
      {
        maxRetries: 10,
        modelName: config.modelName,
        openAIApiKey,
        temperature: config.temperature,
      },
      {
        basePath,
      },
    );
  }

  const reference = config.reference;
  const res = await model.call([
    new SystemMessage(
      `Translate the i18n JSON file from ${from} to ${to} according to the BCP 47 standard` +
        (reference
          ? `\nHere are some reference to help with better translation.  ---${reference}---`
          : '') +
        `\n Keep the keys the same as the original file and make sure the output remains a valid i18n JSON file.`,
    ),
    new HumanMessage(JSON.stringify(json)),
  ]);

  if (!res['text'])
    alert.error('translate failed, please check your network or try again...', true);

  const message = JSON.parse(res['text']);

  return message;
};
