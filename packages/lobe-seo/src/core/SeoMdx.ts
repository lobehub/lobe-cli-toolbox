import { alert } from '@lobehub/cli-ui';
// @ts-ignore
import dJSON from 'dirty-json';
import OpenAI from 'openai';

import { promptSeo } from '@/prompts/seo';
import { PostSEO } from '@/types/blog';
import { SeoConfig } from '@/types/config';

import { ChatPromptTemplate } from '../../../common/promptTemplate';

export class SeoMdx {
  private client: OpenAI;
  private config: SeoConfig;
  private isJsonMode: boolean;
  prompt: ChatPromptTemplate<{ content: string }>;

  constructor(config: SeoConfig, openAIApiKey: string, openAIProxyUrl?: string) {
    this.config = config;
    this.client = new OpenAI({
      apiKey: openAIApiKey,
      baseURL: openAIProxyUrl,
      maxRetries: 4,
    });
    this.prompt = promptSeo(this.config.reference);
    this.isJsonMode = Boolean(this.config?.experimental?.jsonMode);
  }

  async run(content: string): Promise<PostSEO | any> {
    try {
      const messages = await this.prompt.formatMessages({
        content,
      });

      const completion = await this.client.chat.completions.create({
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        model: this.config.modelName || 'gpt-3.5-turbo',
        temperature: this.config.temperature,
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
          alert.error('seo dirty json fail');
          alert.error(result as string, true);
        }
      }
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error?: any) {
    alert.error(`Seo failed, ${error || 'please check your network or try again...'}`, true);
  }
}
