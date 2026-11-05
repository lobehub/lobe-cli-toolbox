import { type ResolvedProviderConfig, resolveProviderConfig } from '@lobehub/cli-common/providers';
import { merge } from 'lodash-es';
import pMap from 'p-map';

import { TranslateMarkdown } from '@/core/TranslateMarkdown';
import type { LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { MarkdownModeType } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { writeJSON, writeMarkdown } from '@/utils/fs';
import { mergeJsonFromChunks } from '@/utils/mergeJsonFromChunks';
import { splitJsonToChunks } from '@/utils/splitJsonToChunks';

import { TranslateLocale } from './TranslateLocale';

export interface I18nOptions {
  config: I18nConfig;
  /**
   * @deprecated Use `provider` instead, kept for OpenAI compatible endpoints
   */
  openAIApiKey?: string;
  /**
   * @deprecated Use `provider` instead, kept for OpenAI compatible endpoints
   */
  openAIProxyUrl?: string;
  provider?: ResolvedProviderConfig;
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

export interface I18nMarkdownTranslateOptions extends Pick<
  I18nTranslateOptions,
  'from' | 'to' | 'onProgress'
> {
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
  constructor({ openAIApiKey, openAIProxyUrl, config, provider }: I18nOptions) {
    const resolved =
      provider ||
      resolveProviderConfig({
        apiKey: openAIApiKey,
        baseURL: openAIProxyUrl,
        model: config.modelName,
      });
    this.config = config;
    this.config.modelName = resolved.model;
    this.translateLocaleService = new TranslateLocale(config, resolved);
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
    const prompt = this.translateLocaleService.promptString.formatMessages({
      from: from || this.config.entryLocale,
      text: '',
      to,
    });
    const splitString = await this.translateMarkdownService.genSplitMarkdown(md);

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
      const progress = Math.floor((completedChunks / this.maxStep) * 100);

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
          // 只有当前面的 chunks 都完成了，才能正确组装；只取连续完成的前缀，避免顺序错乱
          if (index === 0 || chunkProgress.slice(0, index).every((status) => status === 2)) {
            const firstPending = chunkProgress.findIndex((status) => status !== 2);
            const completedPrefix =
              firstPending === -1 ? tempResults : tempResults.slice(0, firstPending);
            mergedResult = await this.translateMarkdownService.genMarkdownByString(completedPrefix);
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

    // 过滤掉 Markdown 特有的参数，只保留 translate 方法需要的参数
    /* eslint-disable unused-imports/no-unused-vars */
    // filename 指向 .md 文件，不能传给 translate，否则会被立即保存写成 JSON
    const { filename, matter, mode, onChunkComplete, ...translateOptions } = rest;
    /* eslint-enable unused-imports/no-unused-vars */

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
    const prompt = this.translateLocaleService.promptJson.formatMessages({
      from: from || this.config.entryLocale,
      json: JSON.stringify({}),
      to,
    });
    const splitJson = splitJsonToChunks(this.config, entry, target);

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
      const progress = Math.floor((completedChunks / this.maxStep) * 100);

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

    const result =
      this.config.saveImmediately && filename
        ? mergedResult
        : merge(target, mergeJsonFromChunks(translatedSplitJson));

    return {
      result,
      tokenUsage: needToken + calcToken(JSON.stringify(translatedSplitJson)),
    };
  }
}
