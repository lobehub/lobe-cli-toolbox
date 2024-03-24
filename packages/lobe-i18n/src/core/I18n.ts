import { merge } from 'lodash-es';
import pMap from 'p-map';

import { TranslateMarkdown } from '@/core/TranslateMarkdown';
import { LocaleObj } from '@/types';
import { I18nConfig, MarkdownModeType } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { mergeJsonFromChunks } from '@/utils/mergeJsonFromChunks';
import { splitJsonToChunks } from '@/utils/splitJsonToChunks';

import { TranslateLocale } from './TranslateLocale';

export interface I18nOptions {
  config: I18nConfig;
  openAIApiKey: string;
  openAIProxyUrl: string;
}

export interface onProgressProps {
  isLoading: boolean;
  maxStep: number;
  needToken?: number;
  progress: number;
  step: number;
}
export interface I18nTranslateOptions {
  entry: LocaleObj;
  from?: string;
  onProgress?: (props: onProgressProps) => void;
  target: LocaleObj;
  to: string;
}

export interface I18nMarkdownTranslateOptions
  extends Pick<I18nTranslateOptions, 'from' | 'to' | 'onProgress'> {
  matter?: any;
  md: string;
  mode: MarkdownModeType;
}

export interface I18nWriteOptions extends I18nTranslateOptions {
  filename: string;
}

export interface I18nMarkdownWriteOptions extends I18nMarkdownTranslateOptions {
  filename: string;
}

export class I18n {
  private config: I18nConfig;
  private step: number = 0;
  private maxStep: number = 1;
  private translateLocaleService: TranslateLocale;
  private translateMarkdownService: TranslateMarkdown;
  constructor({ openAIApiKey, openAIProxyUrl, config }: I18nOptions) {
    this.config = config;
    this.translateLocaleService = new TranslateLocale(config, openAIApiKey, openAIProxyUrl);
    this.translateMarkdownService = new TranslateMarkdown(config);
  }

  async translateMarkdown(options: I18nMarkdownTranslateOptions): Promise<
    | {
        result: string;
        tokenUsage: number;
      }
    | undefined
  > {
    return options.mode === MarkdownModeType.STRING
      ? this.translateMarkdownByString(options)
      : this.translateMarkdownByMdast(options);
  }

  async translateMarkdownByString({
    md,
    to,
    onProgress,
    from,
  }: I18nMarkdownTranslateOptions): Promise<{ result: string; tokenUsage: number } | undefined> {
    const prompt = await this.translateLocaleService.promptString.formatMessages({
      from,
      text: '',
      to,
    });
    const splitString = await this.translateMarkdownService.genSplitMarkdown(
      md,
      JSON.stringify(prompt),
    );

    this.maxStep = splitString.length;
    this.step = 0;

    if (splitString.length === 0) return;

    const needToken =
      splitString.length * calcToken(JSON.stringify(prompt)) +
      calcToken(JSON.stringify(splitString));

    onProgress?.({
      isLoading: true,
      maxStep: this.maxStep,
      needToken,
      progress: 0,
      step: 0,
    });

    const translatedSplitString: string[] = await pMap(
      splitString,
      async (text) => {
        onProgress?.({
          isLoading: this.step < this.maxStep,
          maxStep: this.maxStep,
          needToken,
          progress: this.step < this.maxStep ? Math.floor((this.step / this.maxStep) * 100) : 100,
          step: this.step,
        });
        const result = await this.translateLocaleService.runByString({
          from,
          text,
          to,
        });
        if (this.step < this.maxStep) this.step++;
        return result;
      },
      { concurrency: this.config?.concurrency },
    );

    onProgress?.({
      isLoading: false,
      maxStep: this.maxStep,
      needToken,
      progress: 100,
      step: this.maxStep,
    });

    const result = await this.translateMarkdownService.genMarkdownByString(translatedSplitString);

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(translatedSplitString)),
    };
  }

  async translateMarkdownByMdast({ md, ...rest }: I18nMarkdownTranslateOptions): Promise<
    | {
        result: string;
        tokenUsage: number;
      }
    | undefined
  > {
    const target = await this.translateMarkdownService.genTarget(md);

    const translatedTarget = await this.translate({
      ...rest,
      entry: target,
      target: {},
    });

    if (!translatedTarget?.result) return;

    const result = await this.translateMarkdownService.genMarkdownByMdast(translatedTarget);

    if (!result) return;

    return {
      result,
      tokenUsage: translatedTarget.tokenUsage,
    };
  }

  async translate({ entry, target, to, onProgress, from }: I18nTranslateOptions): Promise<
    | {
        result: LocaleObj;
        tokenUsage: number;
      }
    | undefined
  > {
    const prompt = await this.translateLocaleService.promptJson.formatMessages({
      from,
      json: {},
      to,
    });
    const splitJson = splitJsonToChunks(this.config, entry, target, JSON.stringify(prompt));

    this.maxStep = splitJson.length;
    this.step = 0;

    if (splitJson.length === 0) return;

    const needToken =
      splitJson.length * calcToken(JSON.stringify(prompt)) + calcToken(JSON.stringify(splitJson));

    onProgress?.({
      isLoading: true,
      maxStep: this.maxStep,
      needToken,
      progress: 0,
      step: 0,
    });

    const translatedSplitJson: LocaleObj[] = await pMap(
      splitJson,
      async (json) => {
        onProgress?.({
          isLoading: this.step < this.maxStep,
          maxStep: this.maxStep,
          needToken,
          progress: this.step < this.maxStep ? Math.floor((this.step / this.maxStep) * 100) : 100,
          step: this.step,
        });
        const result = await this.translateLocaleService.runByJson({
          from,
          json,
          to,
        });
        if (this.step < this.maxStep) this.step++;
        return result;
      },
      { concurrency: this.config?.concurrency },
    );

    onProgress?.({
      isLoading: false,
      maxStep: this.maxStep,
      needToken,
      progress: 100,
      step: this.maxStep,
    });

    const result = await merge(target, mergeJsonFromChunks(translatedSplitJson));

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(translatedSplitJson)),
    };
  }
}
