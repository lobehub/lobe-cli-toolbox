import type { SeoConfig } from '@/types/config';

export const DEFAULT_CONFIG: Partial<SeoConfig> = {
  concurrency: 5,
  entryExtension: '.mdx',
  temperature: 0,
};
