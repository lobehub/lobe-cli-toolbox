import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { alert } from '@lobehub/cli-ui';

import { promptSeo } from '@/prompts/seo';
import { PostSEO } from '@/types/blog';
import { SeoConfig } from '@/types/config';

export class SeoMdx {
  private model: ChatOpenAI;
  private config: SeoConfig;
  private isJsonMode: boolean;
  prompt: ChatPromptTemplate<{ content: string }>;
  constructor(config: SeoConfig, openAIApiKey: string, openAIProxyUrl?: string) {
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
    });
    this.prompt = promptSeo(this.config.reference);
    this.isJsonMode = Boolean(this.config?.experimental?.jsonMode);
  }
  async run(content: string): Promise<PostSEO | any> {
    try {
      const formattedPrompt = await this.prompt.formatMessages({
        content,
      });

      const res = await this.model.call(
        formattedPrompt,
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
    alert.error(`Seo failed, ${error || 'please check your network or try again...'}`, true);
  }
}
