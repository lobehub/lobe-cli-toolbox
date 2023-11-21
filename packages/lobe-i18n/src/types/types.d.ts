import { I18nConfig } from '@/types/config';

export type Config = I18nConfig;

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      OPENAI_API_KEYL: string;
      OPENAI_PROXY_URL: string;
      // add more environment variables and their types here
    }
  }
}
