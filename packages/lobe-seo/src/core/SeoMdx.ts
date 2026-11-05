import { LLMClient } from '@lobehub/cli-common/llm';
import type { ChatPromptTemplate } from '@lobehub/cli-common/promptTemplate';
import type { ResolvedProviderConfig } from '@lobehub/cli-common/providers';
import { alert } from '@lobehub/cli-ui';
// @ts-ignore
import dJSON from 'dirty-json';

import { promptSeo } from '@/prompts/seo';
import type { PostSEO } from '@/types/blog';
import type { SeoConfig } from '@/types/config';

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
      const messages = this.prompt.formatMessages({
        content,
      });

      const { text: result } = await this.client.generate({
        json: this.isJsonMode,
        messages,
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
