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
      from: from || this.config.entryLocale,
      text: '',
      to,
    });
    const splitString = await this.translateMarkdownService.genSplitMarkdown(
      md,
      JSON.stringify(prompt),
    );

    this.maxStep = splitString.length;

    if (splitString.length === 0) return;

    const needToken =
      splitString.length * calcToken(JSON.stringify(prompt)) +
      calcToken(JSON.stringify(splitString));

    // 创建进度跟踪数组：0=未开始，1=进行中，2=已完成
    const chunkProgress = Array.from({ length: this.maxStep }, () => 0);

    const updateProgress = () => {
      const completedChunks = chunkProgress.filter((status) => status === 2).length;
      const inProgressChunks = chunkProgress.filter((status) => status === 1).length;

      let progress = 0;
      if (completedChunks === this.maxStep) {
        progress = 100;
      } else if (inProgressChunks > 0) {
        // 有正在进行的chunk，计算接近完成的进度
        const baseProgress = (completedChunks / this.maxStep) * 100;
        const nextMilestone = ((completedChunks + 1) / this.maxStep) * 100;
        progress = Math.floor(Math.max(baseProgress, nextMilestone - 1));
      } else {
        // 只有已完成的chunk
        progress = Math.floor((completedChunks / this.maxStep) * 100);
      }

      onProgress?.({
        isLoading: completedChunks < this.maxStep,
        maxStep: this.maxStep,
        needToken,
        progress,
        step: completedChunks,
      });
    };

    onProgress?.({
      isLoading: true,
      maxStep: this.maxStep,
      needToken,
      progress: 0,
      step: 0,
    });

    const translatedSplitString: string[] = await pMap(
      splitString,
      async (text, index) => {
        // 标记为进行中
        chunkProgress[index] = 1;
        updateProgress();

        // 延迟一下再更新进度，模拟处理过程
        setTimeout(() => {
          updateProgress();
        }, 800);

        const result = await this.translateLocaleService.runByString({
          from: from || this.config.entryLocale,
          text,
          to,
        });

        // 标记为已完成
        chunkProgress[index] = 2;
        updateProgress();

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
      from: from || this.config.entryLocale,
      json: JSON.stringify({}),
      to,
    });
    const splitJson = splitJsonToChunks(this.config, entry, target, JSON.stringify(prompt));

    this.maxStep = splitJson.length;

    if (splitJson.length === 0) return;

    const needToken =
      splitJson.length * calcToken(JSON.stringify(prompt)) + calcToken(JSON.stringify(splitJson));

    // 创建进度跟踪数组：0=未开始，1=进行中，2=已完成
    const chunkProgress = Array.from({ length: this.maxStep }, () => 0);

    const updateProgress = () => {
      const completedChunks = chunkProgress.filter((status) => status === 2).length;
      const inProgressChunks = chunkProgress.filter((status) => status === 1).length;

      let progress = 0;
      if (completedChunks === this.maxStep) {
        progress = 100;
      } else if (inProgressChunks > 0) {
        // 有正在进行的chunk，计算接近完成的进度
        const baseProgress = (completedChunks / this.maxStep) * 100;
        const nextMilestone = ((completedChunks + 1) / this.maxStep) * 100;
        progress = Math.floor(Math.max(baseProgress, nextMilestone - 1));
      } else {
        // 只有已完成的chunk
        progress = Math.floor((completedChunks / this.maxStep) * 100);
      }

      onProgress?.({
        isLoading: completedChunks < this.maxStep,
        maxStep: this.maxStep,
        needToken,
        progress,
        step: completedChunks,
      });
    };

    onProgress?.({
      isLoading: true,
      maxStep: this.maxStep,
      needToken,
      progress: 0,
      step: 0,
    });

    const translatedSplitJson: LocaleObj[] = await pMap(
      splitJson,
      async (json, index) => {
        // 标记为进行中
        chunkProgress[index] = 1;
        updateProgress();

        // 延迟一下再更新进度，模拟处理过程
        setTimeout(() => {
          updateProgress();
        }, 800);

        const result = await this.translateLocaleService.runByJson({
          from: from || this.config.entryLocale,
          json,
          to,
        });

        // 标记为已完成
        chunkProgress[index] = 2;
        updateProgress();

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
