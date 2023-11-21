import { render } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { existsSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import Progress from '@/components/Progress';
import { I18n, I18nMarkdownWriteOptions } from '@/core/I18n';
import { selectors } from '@/store';
import type { I18nConfig } from '@/types/config';
import { MarkdownConfig } from '@/types/config';
import { readMarkdown, writeMarkdown } from '@/utils/fs';
import { getMarkdownFolderFiles } from '@/utils/getEntryFile';

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

    const files = this.markdownConfig.entry.filter((item) => item.includes('.md'));
    const dirs = this.markdownConfig.entry.filter((item) => !item.includes('.md'));

    if (files.length > 0) this.genFilesQuery(files);
    if (dirs.length > 0) this.genDirsQuery(dirs);

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
        <Progress isLoading={true} maxStep={1} progress={0} step={0} {...props} />,
      );
      const data = await this.i18n.translateMarkdown({
        ...item,
        onProgress: (rest) => {
          rerender(<Progress {...rest} {...props} />);
        },
      });
      clear();
      if (data) {
        writeMarkdown(item.filename, data);
        consola.success(chalk.yellow(relative('.', item.filename)));
      }
    }
  }

  genDirsQuery(dirs: string[]) {
    const config = this.markdownConfig;
    for (const dir of dirs) {
      const files = getMarkdownFolderFiles(dir).filter((item) => {
        if (!item.includes(config.entryExtension || '.md')) return false;
        for (const locale of config.outputLocales || []) {
          const targetExtension = config.outputExtensionsOverrides?.[locale] || `.${locale}.md`;
          if (!item.includes(targetExtension)) return false;
        }
        return true;
      });
      if (files.length === 0) continue;
      consola.start(
        `Running in ${chalk.bold.cyan(`📂 ${dir}`)}, and has found ${chalk.bold.cyan(
          files.length,
        )} markdowns..`,
      );

      this.genFilesQuery(files, true);
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
          const targetExtension = config.outputExtensionsOverrides?.[locale] || `.${locale}.md`;
          const targetFilename = resolve(
            '.',
            file.replace(config.entryExtension || '.md', targetExtension),
          );
          const isExist = existsSync(targetFilename);
          if (isExist) continue;
          this.query.push({
            filename: targetFilename,
            from: config.entryLocale,
            md: md,
            to: locale,
          });
        }
      } catch {
        consola.error(`${file} not found`);
      }
    }
  }
}

export default TranslateMarkdown;
