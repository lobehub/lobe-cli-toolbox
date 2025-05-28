import { alert } from '@lobehub/cli-ui';
// @ts-ignore
import dJSON from 'dirty-json';
import OpenAI from 'openai';

import { promptJsonTranslate, promptStringTranslate } from '@/prompts/translate';
import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';
import { ChatPromptTemplate } from '@/utils/promptTemplate';

export class TranslateLocale {
  private client: OpenAI;
  private config: I18nConfig;
  private isJsonMode: boolean;
  promptJson: ChatPromptTemplate<{ from?: string; json: string; to: string }>;
  promptString: ChatPromptTemplate<{ from?: string; text: string; to: string }>;

  constructor(config: I18nConfig, openAIApiKey: string, openAIProxyUrl?: string) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: openAIApiKey,
      baseURL: openAIProxyUrl,
      maxRetries: 4,
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
      const messages = await this.promptString.formatMessages({
        from: from || this.config.entryLocale,
        text: text,
        to,
      });

      const completion = await this.client.chat.completions.create({
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: this.config.modelName || 'gpt-3.5-turbo',
        temperature: this.config.temperature,
        top_p: this.config.topP,
      });

      const result = completion.choices[0]?.message?.content;

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
      const messages = await this.promptJson.formatMessages({
        from: from || this.config.entryLocale,
        json: JSON.stringify(json),
        to,
      });

      const completion = await this.client.chat.completions.create({
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: this.config.modelName || 'gpt-3.5-turbo',
        temperature: this.config.temperature,
        top_p: this.config.topP,
        ...(this.isJsonMode && {
          response_format: { type: 'json_object' },
        }),
      });

      const result = completion.choices[0]?.message?.content;

      if (!result) this.handleError();

      try {
        return JSON.parse(result as string);
      } catch {
        alert.warn('parse fail, try to use dirty json');
        try {
          return dJSON.parse(result as string);
        } catch {
          alert.error('i18n dirty json fail');
          alert.error(result as string, true);
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error?: any) {
    alert.error(`Translate failed, ${error || 'please check your network or try again...'}`, true);
  }
}
