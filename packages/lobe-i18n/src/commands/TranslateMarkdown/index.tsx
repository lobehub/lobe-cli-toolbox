import { relative, resolve } from 'node:path';

import { alert, createTaskList } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { isString } from 'lodash-es';

import type { I18nMarkdownWriteOptions } from '@/core/I18n';
import { I18n } from '@/core/I18n';
import { selectors } from '@/store';
import type { I18nConfig, MarkdownConfig } from '@/types/config';
import { MarkdownModeType } from '@/types/config';
import { formatTokens, progressDetail } from '@/utils/formatProgress';
import { readMarkdown, writeMarkdown } from '@/utils/fs';
import { getDefaultExtension } from '@/utils/getDefaultExtension';
import { hashContent, MarkdownCache } from '@/utils/markdownCache';
import { matchInputPattern } from '@/utils/matchInputPattern';

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

    try {
      for (const [index, { hash, source, ...item }] of this.query.entries()) {
        const id = String(index);
        const outputPath = relative('.', item.filename);
        this.cache.markPending(source, item.filename);
        tasks.start(id, { tag: item.to, title: outputPath });

        const data = await this.i18n.translateMarkdown({
          ...item,
          onProgress: ({ maxStep, needToken, progress, step }) => {
            if (maxStep > 0)
              tasks.update(id, { detail: progressDetail(step, maxStep, needToken), progress });
          },
        });

        if (data?.result && Object.keys(data.result).length > 0) {
          const content = this.markdownConfig.includeMatter
            ? data.result
            : matter.stringify(data.result, item.matter);
          writeMarkdown(item.filename, content);
          this.cache.set(source, item.filename, hash);
          totalTokenUsage += data.tokenUsage;
          tasks.finish(id, 'done', formatTokens(data.tokenUsage));
        } else {
          tasks.finish(id, 'warning', 'no translation result');
        }
      }
    } finally {
      await tasks.stop();
    }

    if (totalTokenUsage > 0)
      consola.info('Total token usage:', chalk.cyan(formatTokens(totalTokenUsage)));
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

          const mode = this.getMode(file, md);
          const { data, content } = matter(md);
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
