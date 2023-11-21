import { merge } from 'lodash-es';

import { TranslateMarkdown } from '@/core/TranslateMarkdown';
import { LocaleObj } from '@/types';
import { I18nConfig } from '@/types/config';
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
  md: string;
}

export interface I18nWriteOptions extends I18nTranslateOptions {
  filename: string;
}

export interface I18nMarkdownWriteOptions extends I18nMarkdownTranslateOptions {
  filename: string;
}

export class I18n {
  private config: I18nConfig;
  private translateLocale: TranslateLocale;
  private step: number = 0;
  private maxStep: number = 1;
  constructor({ openAIApiKey, openAIProxyUrl, config }: I18nOptions) {
    this.config = config;
    this.translateLocale = new TranslateLocale(config, openAIApiKey, openAIProxyUrl);
  }

  async translateMarkdown({
    md,
    ...rest
  }: I18nMarkdownTranslateOptions): Promise<string | undefined> {
    const translateMarkdown = new TranslateMarkdown();
    const target = await translateMarkdown.genTarget(md);

    const translatedTarget = await this.translate({
      ...rest,
      entry: target,
      target: {},
    });

    return translateMarkdown.genMarkdown(translatedTarget);
  }

  async translate({
    entry,
    target,
    to,
    onProgress,
    from,
  }: I18nTranslateOptions): Promise<LocaleObj | undefined> {
    const prompt = await this.translateLocale.prompt.formatMessages({ from, json: {}, to });
    const splitJson = splitJsonToChunks(this.config, entry, target, JSON.stringify(prompt));

    if (splitJson.length === 0) return;

    this.maxStep = splitJson.length;
    this.step = 0;

    const translatedSplitJson: LocaleObj[] = [];

    onProgress?.({
      isLoading: true,
      maxStep: this.maxStep,
      progress: 0,
      step: 0,
    });

    for (const json of splitJson) {
      onProgress?.({
        isLoading: this.step < this.maxStep,
        maxStep: this.maxStep,
        progress: this.step < this.maxStep ? Math.floor((this.step / this.maxStep) * 100) : 100,
        step: this.step,
      });
      const result = await this.translateLocale.run({
        from,
        json,
        to,
      });
      if (result) translatedSplitJson.push(result);
      if (this.step < this.maxStep) this.step++;
    }

    onProgress?.({
      isLoading: false,
      maxStep: this.maxStep,
      progress: 100,
      step: this.maxStep,
    });

    return merge(entry, mergeJsonFromChunks(translatedSplitJson));
  }
}
