import { type ResolvedProviderConfig, resolveProviderConfig } from '@lobehub/cli-common/providers';
import { merge } from 'lodash-es';

import { TranslateMarkdown } from '@/core/TranslateMarkdown';
import { buildJsonTranslateMessages, buildMarkdownTranslateMessages } from '@/prompts/translate';
import type { LocaleObj } from '@/types';
import type { I18nConfig, KeyStyle } from '@/types/config';
import { MarkdownModeType } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { isFatalError } from '@/utils/errors';
import { writeJSON, writeMarkdown } from '@/utils/fs';
import { createLimiter, type Limiter } from '@/utils/limiter';
import { splitJsonToChunks } from '@/utils/splitJsonToChunks';
import { createExamplePicker, MAX_EXAMPLES } from '@/utils/translateContext';
import { formatKeyPath } from '@/utils/translateOutput';

import { TranslateLocale } from './TranslateLocale';

export const DEFAULT_CONCURRENCY = 5;

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
  /** Overrides `config.keyStyle`, e.g. when the entry is built from nested paths. */
  keyStyle?: KeyStyle;
  onChunkComplete?: (chunkResult: LocaleObj, mergedResult: LocaleObj) => void;
  onProgress?: (props: onProgressProps) => void;
  /**
   * Persists the merged result after each chunk when `saveImmediately` is on, defaults to
   * writing it to `filename` as JSON
   */
  save?: (mergedResult: LocaleObj) => void;
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

export interface TranslateOutcome<T> {
  /** Chunks that failed (network, rate limit, ...), their content is left untranslated. */
  errors: unknown[];
  /** Keys the model kept dropping or breaking, they are picked up again by the next run. */
  failedKeys: string[];
  /** `undefined` when the result is unusable, e.g. a markdown chunk failed. */
  result?: T;
  tokenUsage: number;
}

type ChunkStatus = 'done' | 'pending' | 'running';

const createProgress = (
  maxStep: number,
  needToken: number,
  onProgress?: (props: onProgressProps) => void,
) => {
  const status: ChunkStatus[] = Array.from({ length: maxStep }, () => 'pending');
  const report = () => {
    const step = status.filter((item) => item === 'done').length;
    onProgress?.({
      isLoading: step < maxStep,
      maxStep,
      needToken,
      progress: Math.floor((step / maxStep) * 100),
      step,
    });
  };
  report();
  return {
    set: (index: number, value: ChunkStatus) => {
      status[index] = value;
      report();
    },
    status,
  };
};

export class I18n {
  private abortError?: unknown;
  private config: I18nConfig;
  private limit: Limiter;
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
    this.limit = createLimiter(config.concurrency ?? DEFAULT_CONCURRENCY);
    this.translateLocaleService = new TranslateLocale(config, resolved);
    this.translateMarkdownService = new TranslateMarkdown(config);
  }

  /**
   * Every LLM request goes through one limiter, so files and locales run in parallel while the
   * total number of in-flight requests stays at `concurrency`.
   */
  private runChunk<T>(task: () => Promise<T>): Promise<T> {
    return this.limit(async () => {
      if (this.abortError) throw this.abortError;
      try {
        return await task();
      } catch (error) {
        if (isFatalError(error)) this.abortError ??= error;
        throw error;
      }
    });
  }

  private collectError(errors: unknown[], error: unknown) {
    if (isFatalError(error)) throw error;
    errors.push(error);
  }

  async translateMarkdown(
    options: I18nMarkdownTranslateOptions,
  ): Promise<TranslateOutcome<string> | undefined> {
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
  }: I18nMarkdownTranslateOptions): Promise<TranslateOutcome<string> | undefined> {
    const { chunks, definition } = await this.translateMarkdownService.genSplitMarkdown(md);
    if (chunks.length === 0) return;

    const source = from || this.config.entryLocale;
    const promptToken = calcToken(
      JSON.stringify(buildMarkdownTranslateMessages({ from: source, text: '', to })),
    );
    const needToken = chunks.length * promptToken + calcToken(JSON.stringify(chunks));
    const progress = createProgress(chunks.length, needToken, onProgress);

    const translated: Array<string | undefined> = Array.from({ length: chunks.length });
    const errors: unknown[] = [];
    let tokenUsage = 0;
    let savedPrefix = 0;

    const saveCompletedPrefix = () => {
      let prefix = savedPrefix;
      while (prefix < translated.length && translated[prefix] !== undefined) prefix++;
      if (prefix === savedPrefix) return;
      savedPrefix = prefix;
      const merged = this.translateMarkdownService.genMarkdownByString(
        translated.slice(0, prefix) as string[],
        prefix === translated.length ? definition : '',
      );
      writeMarkdown(filename!, merged);
      onChunkComplete?.(translated[prefix - 1]!, merged);
    };

    await Promise.all(
      chunks.map((text, index) =>
        this.runChunk(async () => {
          progress.set(index, 'running');
          const { result, tokenUsage: usage } = await this.translateLocaleService.runByString({
            from: source,
            text,
            to,
          });
          tokenUsage += usage;
          translated[index] = result;
          // Only a contiguous prefix can be written, later chunks wait for earlier ones.
          if (this.config.saveImmediately && filename) saveCompletedPrefix();
        })
          .catch((error) => this.collectError(errors, error))
          .finally(() => progress.set(index, 'done')),
      ),
    );

    const complete = errors.length === 0;
    return {
      errors,
      failedKeys: [],
      result: complete
        ? this.translateMarkdownService.genMarkdownByString(translated as string[], definition)
        : undefined,
      tokenUsage,
    };
  }

  async translateMarkdownByMdast({
    md,
    ...rest
  }: I18nMarkdownTranslateOptions): Promise<TranslateOutcome<string> | undefined> {
    const document = await this.translateMarkdownService.genTarget(md);

    // filename points to the .md file and must not reach `translate`, which would save it as JSON
    /* eslint-disable unused-imports/no-unused-vars */
    const { filename, matter, mode, onChunkComplete, ...translateOptions } = rest;
    /* eslint-enable unused-imports/no-unused-vars */

    const translated = await this.translate({
      ...translateOptions,
      entry: document.target,
      target: {},
    });

    if (!translated) return;

    const result =
      translated.errors.length === 0
        ? await this.translateMarkdownService.genMarkdownByMdast(document, translated.result)
        : undefined;

    return { ...translated, result };
  }

  async translate({
    entry,
    target,
    to,
    onProgress,
    from,
    filename,
    onChunkComplete,
    save,
    keyStyle = this.config.keyStyle,
  }: I18nTranslateOptions): Promise<TranslateOutcome<LocaleObj> | undefined> {
    const chunks = splitJsonToChunks({ ...this.config, keyStyle }, entry, target);
    if (chunks.length === 0) return;

    const source = from || this.config.entryLocale;
    const promptToken = calcToken(
      JSON.stringify(buildJsonTranslateMessages({ from: source, json: '', to })),
    );
    const needToken = chunks.length * promptToken + calcToken(JSON.stringify(chunks));
    const progress = createProgress(chunks.length, needToken, onProgress);

    const exampleLimit = this.config.referenceExamples ?? MAX_EXAMPLES;
    const pickExamples = exampleLimit > 0 ? createExamplePicker(entry, target) : undefined;

    let mergedResult: LocaleObj = merge({}, target);
    const errors: unknown[] = [];
    const failedKeys: string[] = [];
    let tokenUsage = 0;

    await Promise.all(
      chunks.map((json, index) =>
        this.runChunk(async () => {
          progress.set(index, 'running');
          const {
            failed,
            result,
            tokenUsage: usage,
          } = await this.translateLocaleService.runByJson({
            examples: pickExamples?.(json, exampleLimit),
            from: source,
            json,
            to,
          });
          tokenUsage += usage;
          failedKeys.push(...failed.map(formatKeyPath));
          mergedResult = merge(mergedResult, result);

          if (this.config.saveImmediately && (save || filename)) {
            if (save) save(mergedResult);
            else writeJSON(filename!, mergedResult);
            onChunkComplete?.(result, mergedResult);
          }
        })
          .catch((error) => this.collectError(errors, error))
          .finally(() => progress.set(index, 'done')),
      ),
    );

    return { errors, failedKeys, result: mergedResult, tokenUsage };
  }
}
