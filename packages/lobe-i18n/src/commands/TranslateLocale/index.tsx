import { writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

import { alert, createTaskList } from '@lobehub/cli-ui';
import chalk from 'chalk';
import { consola } from 'consola';
import { globSync } from 'glob';
import pMap from 'p-map';

import type { I18nWriteOptions } from '@/core/I18n';
import { DEFAULT_CONCURRENCY, I18n } from '@/core/I18n';
import { selectors } from '@/store';
import type { LocaleFolderObj, LocaleObj } from '@/types';
import type { I18nConfig, InlineConfig } from '@/types/config';
import { checkLocaleFolders, checkLocales } from '@/utils/checkLocales';
import { diff } from '@/utils/diffJson';
import { getErrorMessage } from '@/utils/errors';
import { formatTokens, progressDetail, summarizeOutcome } from '@/utils/formatProgress';
import { readJSON, writeJSON } from '@/utils/fs';
import { getEntryFile, getEntryFolderFiles } from '@/utils/getEntryFile';
import { getLocaleObj } from '@/utils/getLocaleObj';
import { createInlineDocument, stringifyInlineJSON } from '@/utils/inlineLocale';
import { isEqualJsonKeys } from '@/utils/isEqualJsonKeys';

class TranslateLocale {
  config: I18nConfig;
  query: I18nWriteOptions[] = [];
  i18n: I18n;
  constructor() {
    this.config = selectors.getLocaleConfig({ allowInline: true });
    this.i18n = new I18n({
      config: this.config,
      provider: selectors.getCheckedProviderConfig(this.config.modelName),
    });
  }

  async start() {
    consola.start('Lobe I18N is analyzing your project... 🤯🌏🔍');
    if (this.config.entry) {
      const isFolder = !this.config.entry.includes('.json') || this.config.entry.includes('*');
      if (isFolder) {
        this.genFolderQuery();
      } else {
        this.genFlatQuery();
      }
    }
    if (this.config.inline) this.genInlineQuery(this.config.inline);
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
        async ([index, item]) => {
          if (fatalError) return;
          const id = String(index);
          tasks.start(id, { tag: item.to, title: relative('.', item.filename) });

          try {
            const data = await this.i18n.translate({
              ...item,
              onProgress: ({ maxStep, needToken, progress, step }) => {
                if (maxStep > 0)
                  tasks.update(id, { detail: progressDetail(step, maxStep, needToken), progress });
              },
            });

            if (!data) return tasks.finish(id, 'warning', 'no translation result');

            totalTokenUsage += data.tokenUsage;
            if (data.result && Object.keys(data.result).length > 0) {
              if (item.save) item.save(data.result);
              else writeJSON(item.filename, data.result);
            }

            const { status, detail } = summarizeOutcome(data);
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
        if (process.stdout.isTTY) {
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
        }

        process.stdout.write(
          `${chalk.cyan(locale)}${chalk.gray(`[${index + 1}/${files.length}] - `)}${chalk.yellow(filename)}`,
        );
        const targetFilename = resolve(config.output, locale, filename);
        const entryObj = entry[filename] as LocaleObj;
        const targetObj = diff(entryObj, getLocaleObj(targetFilename), config).target;
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

    if (process.stdout.isTTY) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
  }

  genInlineQuery(inline: InlineConfig) {
    const { entryLocale, outputLocales } = this.config;
    const files = globSync(inline.entry, { ignore: inline.exclude, nodir: true }).sort();
    if (files.length === 0)
      alert.error(
        `Can't find inline .json files matching ${chalk.bold.yellow(inline.entry)}`,
        true,
      );

    consola.info(
      `Running in ${chalk.bold.cyan('🧩 Inline Mode')} and has found ${chalk.bold.cyan(
        files.length,
      )} files.`,
    );

    for (const file of files) {
      const filename = resolve(file);
      let data: unknown;
      try {
        data = readJSON(filename);
      } catch (error) {
        consola.warn(`Skipped ${chalk.yellow(file)}, ${getErrorMessage(error)}`);
        process.exitCode = 1;
        continue;
      }

      const document = createInlineDocument(data, {
        copyKeys: inline.copyKeys,
        entryLocale,
        locales: outputLocales,
      });
      if (document.nodes.length === 0) continue;

      const write = () => writeFileSync(filename, stringifyInlineJSON(data), 'utf8');
      let synced = false;

      for (const locale of outputLocales) {
        const target = document.target(locale);
        // Nothing to translate, but removed keys and copied values may still need syncing.
        if (diff(document.entry, target).add.length === 0) {
          synced = document.apply(locale, target) || synced;
          continue;
        }

        this.query.push({
          entry: document.entry,
          filename,
          from: entryLocale,
          keyStyle: 'nested',
          save: (result) => {
            if (document.apply(locale, result)) write();
          },
          target,
          to: locale,
        });
      }

      if (synced) write();
    }
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
      const targetObj = diff(entryObj, getLocaleObj(targetFilename), config).target;
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
