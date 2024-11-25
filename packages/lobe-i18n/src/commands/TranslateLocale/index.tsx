import { render } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { relative, resolve } from 'node:path';

import Progress from '@/components/Progress';
import { I18n, I18nWriteOptions } from '@/core/I18n';
import { selectors } from '@/store';
import type { LocaleFolderObj, LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { checkLocaleFolders, checkLocales } from '@/utils/checkLocales';
import { diff } from '@/utils/diffJson';
import { writeJSON } from '@/utils/fs';
import { getEntryFile, getEntryFolderFiles } from '@/utils/getEntryFile';
import { getLocaleObj } from '@/utils/getLocaleObj';
import { isEqualJsonKeys } from '@/utils/isEqualJsonKeys';

class TranslateLocale {
  config: I18nConfig;
  query: I18nWriteOptions[] = [];
  i18n: I18n;
  constructor() {
    this.config = selectors.getLocaleConfig();
    this.i18n = new I18n({
      config: this.config,
      openAIApiKey: selectors.getOpenAIApiKey(),
      openAIProxyUrl: selectors.getOpenAIProxyUrl(),
    });
  }

  async start() {
    consola.start('Lobe I18N is analyzing your project... 🤯🌏🔍');
    const isFolder = !this.config.entry.includes('.json') || this.config.entry.includes('*');
    if (isFolder) {
      this.genFolderQuery();
    } else {
      this.genFlatQuery();
    }
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
        from: item.from || this.config.entryLocale,
        to: item.to,
      };
      const { rerender, clear } = render(
        <Progress hide isLoading maxStep={1} progress={0} step={0} {...props} />,
      );
      const data = await this.i18n.translate({
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
        writeJSON(item.filename, data.result);
        totalTokenUsage += data.tokenUsage;
        consola.success(chalk.yellow(outputPath), chalk.gray(`[Token usage: ${data.tokenUsage}]`));
      } else {
        consola.warn('No translation result was found:', chalk.yellow(outputPath));
      }
    }
    if (totalTokenUsage > 0) consola.info('Total token usage:', chalk.cyan(totalTokenUsage));
  }

  genFolderQuery() {
    const config = this.config;
    const entry = getEntryFolderFiles(config) as LocaleFolderObj;
    const files = Object.keys(entry);
    consola.info(
      `Running in ${chalk.bold.cyan('📂 Folder Mode')} and has found ${chalk.bold.cyan(
        files.length,
      )} files.`,
    );
    checkLocaleFolders(config, files);

    for (const locale of config.outputLocales) {
      for (const [index, filename] of files.entries()) {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);

        process.stdout.write(
          `${chalk.cyan(locale)}${chalk.gray(`[${index + 1}/${files.length}] - `)}${chalk.yellow(filename)}`,
        );
        const targetFilename = resolve(config.output, locale, filename);
        const entryObj = entry[filename] as LocaleObj;
        const targetObj = diff(entryObj, getLocaleObj(targetFilename)).target;
        writeJSON(targetFilename, targetObj);
        if (isEqualJsonKeys(entryObj, targetObj)) continue;
        this.query.push({
          entry: entryObj,
          filename: targetFilename,
          from: config.entryLocale,
          target: targetObj,
          to: locale,
        });
      }
    }

    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
  }

  genFlatQuery() {
    const config = this.config;
    const entry = getEntryFile(config) as LocaleObj;
    consola.start(
      `Running in ${chalk.bold.cyan('📄 Flat Mode')}, and translating ${chalk.bold.cyan(
        config.outputLocales.join('/'),
      )} locales..`,
    );
    checkLocales(config);
    for (const locale of config.outputLocales) {
      const targetFilename = resolve(config.output, locale) + '.json';
      const entryObj = entry;
      const targetObj = diff(entryObj, getLocaleObj(targetFilename)).target;
      writeJSON(targetFilename, targetObj);
      if (isEqualJsonKeys(entryObj, targetObj)) continue;
      this.query.push({
        entry: entryObj,
        filename: targetFilename,
        from: config.entryLocale,
        target: targetObj,
        to: locale,
      });
    }
  }
}

export default TranslateLocale;
