import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { alert } from '@lobehub/cli-ui';

import { promptJsonTranslate, promptStringTranslate } from '@/prompts/translate';
import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';

export class TranslateLocale {
  private model: ChatOpenAI;
  private config: I18nConfig;
  private isJsonMode: boolean;
  promptJson: ChatPromptTemplate<{ from: string; json: string; to: string }>;
  promptString: ChatPromptTemplate<{ from: string; text: string; to: string }>;
  constructor(config: I18nConfig, openAIApiKey: string, openAIProxyUrl?: string) {
    this.config = config;
    this.model = new ChatOpenAI({
      configuration: {
        baseURL: openAIProxyUrl,
      },
      maxConcurrency: config.concurrency,
      maxRetries: 4,
      modelName: config.modelName,
      openAIApiKey,
      temperature: config.temperature,
      topP: config.topP,
    });
    this.promptJson = promptJsonTranslate(config.reference);
    this.promptString = promptStringTranslate(config.reference);
    this.isJsonMode = Boolean(this.config?.experimental?.jsonMode);
  }

  async runByString({
    from,
    to,
    text,
  }: {
    from?: string;
    text: string;
    to: string;
  }): Promise<string | any> {
    try {
      const formattedChatPrompt = await this.promptString.formatMessages({
        from: from || this.config.entryLocale,
        text: text,
        to,
      });

      const res = await this.model.call(formattedChatPrompt);

      const result = res['text'];

      if (!result) this.handleError();
      return result;
    } catch (error) {
      this.handleError(error);
    }
  }
  async runByJson({
    from,
    to,
    json,
  }: {
    from?: string;
    json: LocaleObj;
    to: string;
  }): Promise<LocaleObj | any> {
    try {
      const formattedChatPrompt = await this.promptJson.formatMessages({
        from: from || this.config.entryLocale,
        json: JSON.stringify(json),
        to,
      });

      const res = await this.model.invoke(
        formattedChatPrompt,
        this.isJsonMode
          ? {
              response_format: { type: 'json_object' },
            }
          : undefined,
      );

      const result = this.isJsonMode ? res['content'] : res['text'];

      if (!result) this.handleError();

      const message = JSON.parse(result as string);

      return message;
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error?: any) {
    alert.error(`Translate failed, ${error || 'please check your network or try again...'}`, true);
  }
}
