import { merge } from 'lodash-es';
import pMap from 'p-map';

import { TranslateMarkdown } from '@/core/TranslateMarkdown';
import { LocaleObj } from '@/types';
import { I18nConfig, MarkdownModeType } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { writeJSON, writeMarkdown } from '@/utils/fs';
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
  filename?: string;
  from?: string;
  onChunkComplete?: (chunkResult: LocaleObj, mergedResult: LocaleObj) => void;
  onProgress?: (props: onProgressProps) => void;
  target: LocaleObj;
  to: string;
}

export interface I18nMarkdownTranslateOptions
  extends Pick<I18nTranslateOptions, 'from' | 'to' | 'onProgress'> {
  filename?: string;
  matter?: any;
  md: string;
  mode: MarkdownModeType;
  onChunkComplete?: (chunkResult: string, mergedResult: string) => void;
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
    filename,
    onChunkComplete,
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

    // 用于存储合并的结果
    let mergedResult = '';

    // 预先初始化翻译结果数组，用于立即保存功能
    const tempResults: string[] = Array.from({ length: this.maxStep }, () => '');

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

        // 如果开启立即保存，则每个 chunk 完成后立即合并并保存
        if (this.config.saveImmediately && filename) {
          // 存储当前结果到临时数组
          tempResults[index] = result;
          // 只有当前面的 chunks 都完成了，才能正确组装
          if (index === 0 || chunkProgress.slice(0, index).every((status) => status === 2)) {
            mergedResult = await this.translateMarkdownService.genMarkdownByString(
              tempResults.filter(Boolean),
            );
            writeMarkdown(filename, mergedResult);
            onChunkComplete?.(result, mergedResult);
          }
        }

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

    // 如果开启了立即保存且有合并结果，则使用合并结果，否则使用原有逻辑
    const result =
      this.config.saveImmediately && mergedResult
        ? mergedResult
        : await this.translateMarkdownService.genMarkdownByString(translatedSplitString);

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

    // 过滤掉 Markdown 特有的参数，只保留 translate 方法需要的参数
    /* eslint-disable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars */
    const { matter, mode, onChunkComplete, ...translateOptions } = rest;
    /* eslint-enable @typescript-eslint/no-unused-vars, unused-imports/no-unused-vars */

    const translatedTarget = await this.translate({
      ...translateOptions,
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

  async translate({
    entry,
    target,
    to,
    onProgress,
    from,
    filename,
    onChunkComplete,
  }: I18nTranslateOptions): Promise<
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

    // 用于存储合并的结果
    let mergedResult = merge({}, target);

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

        // 如果开启立即保存，则每个 chunk 完成后立即合并并保存
        if (this.config.saveImmediately && filename) {
          mergedResult = merge(mergedResult, result);
          writeJSON(filename, mergedResult);
          onChunkComplete?.(result, mergedResult);
        }

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

    // 如果没有开启立即保存，则使用原有逻辑
    const result = filename
      ? mergedResult
      : await merge(target, mergeJsonFromChunks(translatedSplitJson));

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(translatedSplitJson)),
    };
  }
}
