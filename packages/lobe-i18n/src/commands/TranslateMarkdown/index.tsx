import { alert, render } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { globSync } from 'glob';
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
      ignore: matchInputPattern(this.markdownConfig.exclude || [], '.md'),
      nodir: true,
    }).filter((file) => file.includes(this.markdownConfig.entryExtension || '.md'));

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
      if (data && Object.keys(data).length > 0) {
        writeMarkdown(item.filename, data);
        consola.success(chalk.yellow(relative('.', item.filename)));
      }
    }
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
          consola.info(`📄 To ${locale}: ${chalk.yellow(file)}`);
          this.query.push({
            filename: targetFilename,
            from: config.entryLocale,
            md,
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
    return resolve(
      '.',
      filePath.replace(this.markdownConfig.entryExtension || '.md', targetExtension),
    );
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
