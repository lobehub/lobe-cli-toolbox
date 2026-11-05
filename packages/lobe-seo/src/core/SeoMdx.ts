import { alert } from '@lobehub/cli-ui';
// @ts-ignore
import dJSON from 'dirty-json';

import { promptSeo } from '@/prompts/seo';
import { PostSEO } from '@/types/blog';
import { SeoConfig } from '@/types/config';

import { type ChatMessage, LLMClient } from '../../../common/llm';
import { ChatPromptTemplate } from '../../../common/promptTemplate';
import type { ResolvedProviderConfig } from '../../../common/providers';

export class SeoMdx {
  private client: LLMClient;
  private config: SeoConfig;
  private isJsonMode: boolean;
  prompt: ChatPromptTemplate<{ content: string }>;

  constructor(config: SeoConfig, provider: ResolvedProviderConfig) {
    this.config = config;
    this.config.modelName = provider.model;
    this.client = new LLMClient(provider);
    this.prompt = promptSeo(this.config.reference);
    this.isJsonMode = Boolean(this.config?.experimental?.jsonMode);
  }

  async run(content: string): Promise<PostSEO | any> {
    try {
      const messages = await this.prompt.formatMessages({
        content,
      });

      const { text: result } = await this.client.generate({
        json: this.isJsonMode,
        messages: messages as ChatMessage[],
        temperature: this.config.temperature,
      });

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
