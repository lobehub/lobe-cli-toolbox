import { alert, render } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { globSync } from 'glob';
import matter from 'gray-matter';
import { isString } from 'lodash-es';
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import Progress from '@/components/Progress';
import { I18n, I18nMarkdownWriteOptions } from '@/core/I18n';
import { selectors } from '@/store';
import type { I18nConfig } from '@/types/config';
import { MarkdownConfig, MarkdownModeType } from '@/types/config';
import { readMarkdown, writeMarkdown } from '@/utils/fs';
import { getDefaultExtension } from '@/utils/getDefaultExtension';
import { matchInputPattern } from '@/utils/matchInputPattern';

class TranslateMarkdown {
  config: I18nConfig;
  markdownConfig: MarkdownConfig;
  query: I18nMarkdownWriteOptions[] = [];
  i18n: I18n;
  constructor() {
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
      openAIApiKey: selectors.getOpenAIApiKey(),
      openAIProxyUrl: selectors.getOpenAIProxyUrl(),
    });
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
      )}) ${this.config.experimental?.jsonMode ? chalk.red(' [JSON Mode]') : ''}}`,
    );
    let totalTokenUsage = 0;
    for (const item of this.query) {
      const props = {
        filename: item.filename,
        from: item.from || this.markdownConfig.entryLocale || this.config.entryLocale,
        to: item.to,
      };

      const { rerender, clear } = render(
        <Progress hide isLoading maxStep={1} progress={0} step={0} {...props} />,
      );
      const data = await this.i18n.translateMarkdown({
        ...item,
        onProgress: (rest) => {
          if (rest.maxStep > 0) {
            rerender(<Progress {...rest} {...props} />);
          } else {
            clear();
          }
        },
      });
      clear();
      const outputPath = relative('.', item.filename);
      if (data?.result && Object.keys(data.result).length > 0) {
        let mdResut = data.result;
        if (!this.markdownConfig.includeMatter) {
          mdResut = matter.stringify(data.result, item.matter);
        }

        writeMarkdown(item.filename, mdResut);
        totalTokenUsage += data.tokenUsage;
        consola.success(chalk.yellow(outputPath), chalk.gray(`[Token usage: ${data.tokenUsage}]`));
      } else {
        consola.warn('No translation result was found:', chalk.yellow(outputPath));
      }
    }
    if (totalTokenUsage > 0) consola.info('Total token usage:', chalk.cyan(totalTokenUsage));
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
        for (const locale of config.outputLocales || []) {
          const targetExtension = this.getTargetExtension(locale, file, md);
          const targetFilename = this.getTargetFilename(file, targetExtension);
          if (existsSync(targetFilename)) continue;
          const mode = this.getMode(file, md);
          const { data, content } = matter(md);
          consola.info(`📄 To ${locale}: ${chalk.yellow(file)}`);
          this.query.push({
            filename: targetFilename,
            from: config.entryLocale,
            matter: data,
            md: this.markdownConfig.includeMatter ? md : content,
            mode,
            to: locale,
          });
        }
      } catch {
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
