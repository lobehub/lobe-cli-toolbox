import { SeoMdx } from '@/core/SeoMdx';
import { BlogPost } from '@/types/blog';
import { SeoConfig } from '@/types/config';
import { calcToken } from '@/utils/calcToken';

export interface SeoOptions {
  config: SeoConfig;
  openAIApiKey: string;
  openAIProxyUrl: string;
}

export interface onProgressProps {
  isLoading: boolean;
  needToken?: number;
}
export interface SeoQueryItem {
  content: string;
  entry: string;
  matter: BlogPost;
  onProgress?: (props: onProgressProps) => void;
  rawContent: string;
}

export class SeoCore {
  private seoService: SeoMdx;
  private config: SeoConfig;
  constructor({ openAIApiKey, openAIProxyUrl, config }: SeoOptions) {
    this.config = config;
    this.seoService = new SeoMdx(config, openAIApiKey, openAIProxyUrl);
  }

  async run({ content, onProgress, matter }: SeoQueryItem): Promise<
    | {
        result: BlogPost;
        tokenUsage: number;
      }
    | undefined
  > {
    const prompt = await this.seoService.prompt.formatMessages({
      content,
    });

    const needToken = calcToken(JSON.stringify(prompt));

    onProgress?.({
      isLoading: true,
      needToken,
    });

    const seoResult = await this.seoService.run(content);

    onProgress?.({
      isLoading: false,
      needToken,
    });

    let result: BlogPost;

    if (this.config.tagStringify) {
      seoResult.tags = seoResult.tags.join(', ');
    }

    result = this.config.groupKey
      ? {
          ...matter,
          [this.config.groupKey]: {
            ...seoResult,
            ...matter?.[this.config.groupKey],
          },
        }
      : {
          ...seoResult,
          ...matter,
        };

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(seoResult)),
    };
  }
}
