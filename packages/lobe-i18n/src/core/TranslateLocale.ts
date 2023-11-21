import { consola } from 'consola';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatPromptTemplate } from 'langchain/prompts';

import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export class TranslateLocale {
  model: ChatOpenAI;
  config: I18nConfig;
  prompt: ChatPromptTemplate<{ from: string; json: string; to: string }>;

  constructor(config: I18nConfig, openAIApiKey: string, openAIProxyUrl?: string) {
    this.config = config;
    this.model = new ChatOpenAI(
      {
        maxRetries: 10,
        modelName: config.modelName,
        openAIApiKey,
        temperature: config.temperature,
      },
      {
        basePath: openAIProxyUrl,
      },
    );
    this.prompt = this.genChatPrompt();
  }

  genChatPrompt() {
    const systemTemplate = [
      `Translate the i18n JSON file from {from} to {to} according to the BCP 47 standard`,
      this.config.reference &&
        `Here are some reference to help with better translation.  ---${this.config.reference}---`,
      `Keep the keys the same as the original file and make sure the output remains a valid i18n JSON file.`,
    ]
      .filter(Boolean)
      .join('\n');

    const humanTemplate = '{json}';

    return ChatPromptTemplate.fromPromptMessages<{
      from: string;
      json: string;
      to: string;
    }>([
      ['system', systemTemplate],
      ['human', humanTemplate],
    ]);
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
