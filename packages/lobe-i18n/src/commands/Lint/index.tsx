import { resolve } from 'node:path';

import chalk from 'chalk';
import { consola } from 'consola';

import { selectors } from '@/store';

import type { LintResult } from './types';
import { displayResults } from './utils/displayUtils';
import { checkFieldLanguages } from './utils/fieldChecker';
import { processLintFile } from './utils/fileUtils';

class Lint {
  async start(quiet?: boolean) {
    try {
      consola.log('🔍 Linting translation files...');

      const config = selectors.getLocaleConfig();
      const localesPath = resolve(config.output);
      const isFolder = !config.entry.includes('.json') || config.entry.includes('*');

      if (isFolder) {
        consola.log(`Running in ${chalk.bold.cyan('📂 Folder Mode')}`);
        await this.lintFolderMode(config, localesPath, quiet);
      } else {
        consola.log(`Running in ${chalk.bold.cyan('📄 Flat Mode')}`);
        await this.lintFlatMode(config, localesPath, quiet);
      }
    } catch (error) {
      consola.error('Linting failed:', error);
      process.exit(1);
    }
  }

  private async lintFolderMode(config: any, localesPath: string, quiet?: boolean) {
    // 参考 TranslateLocale.genFolderQuery() 的逻辑
    const { getEntryFolderFiles } = await import('@/utils/getEntryFile');
    const entry = getEntryFolderFiles(config);
    if (!entry) {
      consola.error('No entry files found');
      return;
    }
    const files = Object.keys(entry);

    consola.info(`Found ${chalk.bold.cyan(files.length)} files.`);

    const lintResults: LintResult[] = [];

    for (const locale of [config.entryLocale, ...config.outputLocales]) {
      for (const filename of files) {
        const targetFilename = resolve(localesPath, locale, filename);
        const issues = await processLintFile(targetFilename, locale, checkFieldLanguages);
        if (issues.length > 0) {
          lintResults.push({
            file: targetFilename,
            issues,
          });
        }
      }
    }

    displayResults(lintResults, quiet);
  }

  private async lintFlatMode(config: any, localesPath: string, quiet?: boolean) {
    // 参考 TranslateLocale.genFlatQuery() 的逻辑
    const lintResults: LintResult[] = [];

    for (const locale of [config.entryLocale, ...config.outputLocales]) {
      const targetFilename = resolve(localesPath, locale) + '.json';
      const issues = await processLintFile(targetFilename, locale, checkFieldLanguages);
      if (issues.length > 0) {
        lintResults.push({
          file: targetFilename,
          issues,
        });
      }
    }

    displayResults(lintResults, quiet);
  }
}

export default Lint;
