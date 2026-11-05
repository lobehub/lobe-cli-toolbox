import { relative, resolve } from 'node:path';

import { alert, createTaskList } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { isString } from 'lodash-es';
import pMap from 'p-map';

import type { I18nMarkdownWriteOptions } from '@/core/I18n';
import { DEFAULT_CONCURRENCY, I18n } from '@/core/I18n';
import { selectors } from '@/store';
import type { I18nConfig, MarkdownConfig } from '@/types/config';
import { MarkdownModeType } from '@/types/config';
import { getErrorMessage } from '@/utils/errors';
import { formatTokens, progressDetail, summarizeOutcome } from '@/utils/formatProgress';
import { readMarkdown, writeMarkdown } from '@/utils/fs';
import { getDefaultExtension } from '@/utils/getDefaultExtension';
import { hashContent, MarkdownCache } from '@/utils/markdownCache';
import { matchInputPattern } from '@/utils/matchInputPattern';
import { pickMatter } from '@/utils/pickMatter';

interface MarkdownQueryItem extends I18nMarkdownWriteOptions {
  hash: string;
  source: string;
}

export interface TranslateMarkdownOptions {
  /**
   * @description Ignore the cache and retranslate every target file
   */
  force?: boolean;
}

class TranslateMarkdown {
  config: I18nConfig;
  markdownConfig: MarkdownConfig;
  query: MarkdownQueryItem[] = [];
  i18n: I18n;
  cache: MarkdownCache;
  force: boolean;
  constructor({ force = false }: TranslateMarkdownOptions = {}) {
    this.force = force;
    this.markdownConfig = selectors.getMarkdownConfigFile();
    const defaultConfig = selectors.getConfigFile();
    this.config = {
      ...defaultConfig,
      entryLocale: defaultConfig.entryLocale || (this.markdownConfig.entryLocale as string),
      markdown: this.markdownConfig,
      outputLocales: defaultConfig.outputLocales || this.markdownConfig.outputLocales,
    };
    this.i18n = new I18n({
      config: this.config,
      provider: selectors.getCheckedProviderConfig(this.config.modelName),
    });
    this.cache = new MarkdownCache(this.markdownConfig.cacheFile);
  }

  async start() {
    consola.start('Lobe I18N is analyzing your markdown... 🤯🌏🔍');
    const entry = this.markdownConfig.entry;

    if (!entry || entry.length === 0) alert.error('No markdown entry was found.', true);

    let files = globSync(matchInputPattern(entry, '.md'), {
      ignore: this.markdownConfig.exclude
        ? matchInputPattern(this.markdownConfig.exclude || [], '.md')
        : undefined,
      nodir: true,
    });

    if (this.markdownConfig.entryExtension)
      files = files.filter((file) => file.includes(this.markdownConfig.entryExtension || '.md'));

    if (!files || files.length === 0) alert.error('No markdown entry was found.', true);

    this.genFilesQuery(files);

    if (this.query.length > 0) {
      await this.runQuery();
    } else {
      consola.success('No content requiring translation was found.');
    }
    consola.success('All i18n tasks have been completed！');
  }

  async runQuery() {
    consola.info(
      `Current model setting: ${chalk.cyan(this.config.modelName)} (temperature: ${chalk.cyan(
        this.config.temperature,
      )}) ${this.config.experimental?.jsonMode ? chalk.red(' [JSON Mode]') : ''}`,
    );
    const tasks = createTaskList({
      tagWidth: Math.max(...this.query.map((item) => item.to.length)) + 1,
      total: this.query.length,
    });
    let totalTokenUsage = 0;
    let fatalError: unknown;

    try {
      // Requests are bounded by the limiter inside I18n, this only bounds the visible tasks.
      await pMap(
        this.query.entries(),
        async ([index, { hash, source, ...item }]) => {
          if (fatalError) return;
          const id = String(index);
          this.cache.markPending(source, item.filename);
          tasks.start(id, { tag: item.to, title: relative('.', item.filename) });

          try {
            const data = await this.i18n.translateMarkdown({
              ...item,
              onProgress: ({ maxStep, needToken, progress, step }) => {
                if (maxStep > 0)
                  tasks.update(id, { detail: progressDetail(step, maxStep, needToken), progress });
              },
            });

            if (!data) return tasks.finish(id, 'warning', 'no translation result');
            totalTokenUsage += data.tokenUsage;
            const outcome = { ...data, errors: [...data.errors], failedKeys: [...data.failedKeys] };

            // A partial document stays pending in the cache, so the next run retranslates it.
            if (data.result) {
              let content = data.result;
              if (!this.markdownConfig.includeMatter) {
                const matterData = await this.translateMatter(item);
                totalTokenUsage += matterData.tokenUsage;
                outcome.tokenUsage += matterData.tokenUsage;
                outcome.errors.push(...matterData.errors);
                outcome.failedKeys.push(...matterData.failedKeys);
                content = matter.stringify(data.result, matterData.result);
              }
              writeMarkdown(item.filename, content);
              if (outcome.errors.length === 0 && outcome.failedKeys.length === 0)
                this.cache.set(source, item.filename, hash);
            }

            const { status, detail } = summarizeOutcome(outcome);
            if (status === 'error') process.exitCode = 1;
            tasks.finish(id, status, detail);
          } catch (error) {
            fatalError ??= error;
            tasks.finish(id, 'error', getErrorMessage(error));
          }
        },
        { concurrency: this.config.concurrency ?? DEFAULT_CONCURRENCY, stopOnError: false },
      );
    } finally {
      await tasks.stop();
    }

    if (totalTokenUsage > 0)
      consola.info('Total token usage:', chalk.cyan(formatTokens(totalTokenUsage)));
    if (fatalError) alert.error(`Translate failed, ${getErrorMessage(fatalError)}`, true);
  }

  genFilesQuery(files: string[], skipLog?: boolean) {
    const config = this.markdownConfig;
    if (!skipLog)
      consola.start(
        `Running in ${chalk.bold.cyan(
          `📄 ${files.length} Markdown`,
        )}, and translating to ${chalk.bold.cyan(config?.outputLocales?.join('/'))} locales..`,
      );
    for (const file of files) {
      try {
        const md = readMarkdown(file);
        const hash = hashContent(md);
        let parsed: { content: string; data: any; mode: MarkdownModeType } | undefined;
        for (const locale of config.outputLocales || []) {
          const targetExtension = this.getTargetExtension(locale, file, md);
          const targetFilename = this.getTargetFilename(file, targetExtension);
          const status = this.cache.getStatus(file, targetFilename, hash);

          if (!this.force) {
            if (status === 'cached') continue;
            // Targets translated before the cache existed are trusted as up to date,
            // otherwise the first run would retranslate and overwrite every existing file.
            if (status === 'untracked') {
              this.cache.set(file, targetFilename, hash);
              continue;
            }
          }

          parsed ??= { ...matter(md), mode: this.getMode(file, md) };
          const { content, data, mode } = parsed;
          const reason = status === 'changed' ? chalk.gray(' [source changed]') : '';
          consola.info(`📄 To ${locale}: ${chalk.yellow(targetFilename)}${reason}`);
          this.query.push({
            filename: targetFilename,
            from: config.entryLocale,
            hash,
            matter: data,
            md: this.markdownConfig.includeMatter ? md : content,
            mode,
            source: file,
            to: locale,
          });
        }
      } catch (error) {
        consola.error(`Error processing file ${file}:`, error);
        alert.error(`${file} not found`, true);
      }
    }
  }

  /** Translates the `matterKeys` of the front matter, a key that fails keeps the source text. */
  private async translateMatter({
    from,
    matter: data = {},
    to,
  }: Pick<MarkdownQueryItem, 'from' | 'matter' | 'to'>) {
    const entry = pickMatter(data, this.markdownConfig.matterKeys);
    const translated =
      Object.keys(entry).length > 0
        ? await this.i18n.translate({ entry, from, target: {}, to })
        : undefined;
    return {
      errors: translated?.errors ?? [],
      failedKeys: translated?.failedKeys ?? [],
      result: { ...data, ...translated?.result },
      tokenUsage: translated?.tokenUsage ?? 0,
    };
  }

  private getTargetExtension(locale: string, filePath: string, fileContent: string) {
    return (
      this.markdownConfig.outputExtensions?.(locale, {
        fileContent,
        filePath,
        getDefaultExtension,
      }) || getDefaultExtension(locale)
    );
  }

  private getTargetFilename(filePath: string, targetExtension: string) {
    if (this.markdownConfig.entryExtension) {
      return resolve(
        '.',
        filePath.replace(this.markdownConfig.entryExtension || '.md', targetExtension),
      );
    } else {
      if (
        this.markdownConfig.entryLocale &&
        filePath.includes(`.${this.markdownConfig.entryLocale}.`)
      ) {
        const filePaths = filePath.split(`.${this.markdownConfig.entryLocale}.`) as string[];
        return [filePaths[0], targetExtension].join('');
      } else {
        const filePaths = filePath.split('.');
        filePaths.pop();
        return [filePaths.join('.'), targetExtension].join('');
      }
    }
  }

  private getMode(filePath: string, fileContent: string) {
    const modeConfig = this.markdownConfig.mode;
    if (!modeConfig) return MarkdownModeType.STRING;
    return isString(modeConfig)
      ? modeConfig
      : modeConfig({ fileContent, filePath }) || MarkdownModeType.STRING;
  }
}

export default TranslateMarkdown;
