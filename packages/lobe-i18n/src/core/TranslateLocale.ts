import { consola } from 'consola';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';

import { promptTranslate } from '@/prompts/translate';
import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export class TranslateLocale {
  private model: ChatOpenAI;
  private config: I18nConfig;
  prompt: ChatPromptTemplate<{ from: string; json: string; to: string }>;

  constructor(config: I18nConfig, openAIApiKey: string, openAIProxyUrl?: string) {
    this.config = config;
    this.model = new ChatOpenAI({
      configuration: {
        baseURL: openAIProxyUrl,
      },
      maxRetries: 10,
      modelName: config.modelName,
      openAIApiKey,
      temperature: config.temperature,
    });
    this.prompt = promptTranslate(config.reference);
  }

  async run({
    from,
    to,
    json,
  }: {
    from?: string;
    json: LocaleObj;
    to: string;
  }): Promise<LocaleObj | undefined> {
    try {
      const formattedChatPrompt = await this.prompt.formatMessages({
        from: from || this.config.entryLocale,
        json: JSON.stringify(json),
        to,
      });

      const res = await this.model.call(formattedChatPrompt);

      if (!res['text']) {
        consola.error('translate failed, please check your network or try again...');
        return;
      }

      const message = JSON.parse(res['text']);

      return message;
    } catch (error) {
      consola.error('translate failed, please check your network or try again...', error);
      return;
    }
  }
}
