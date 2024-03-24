import { SeoConfig } from '@/types/config';

export type Config = SeoConfig;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      OPENAI_API_KEY: string;
      OPENAI_PROXY_URL: string;
      // add more environment variables and their types here
    }
  }
}
