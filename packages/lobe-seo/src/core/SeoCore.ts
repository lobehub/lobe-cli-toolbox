import type { ResolvedProviderConfig } from '@lobehub/cli-common/providers';

import { SeoMdx } from '@/core/SeoMdx';
import type { BlogPost } from '@/types/blog';
import type { SeoConfig } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { mergeSeoResult } from '@/utils/mergeSeoResult';

export interface SeoOptions {
  config: SeoConfig;
  provider: ResolvedProviderConfig;
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
  constructor({ provider, config }: SeoOptions) {
    this.config = config;
    this.seoService = new SeoMdx(config, provider);
  }

  async run({ content, onProgress, matter }: SeoQueryItem): Promise<
    | {
        result: BlogPost;
        tokenUsage: number;
      }
    | undefined
  > {
    const prompt = this.seoService.prompt.formatMessages({
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

    const result = mergeSeoResult(matter, seoResult, {
      groupKey: this.config.groupKey,
      tagStringify: this.config.tagStringify,
    });

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(seoResult)),
    };
  }
}
