import chalk from 'chalk';
import { consola } from 'consola';
import { resolve } from 'node:path';

import { selectors } from '@/store';

import { HYPHENATED_LANGUAGE_MAP, REVERSE_LANGUAGE_MAP } from './constants';
import { LintResult } from './types';
import { displayResults } from './utils/displayUtils';
import { checkFieldLanguages } from './utils/fieldChecker';
import { processLintFile } from './utils/fileUtils';

// 将带连字符的映射添加到反向映射中
Object.entries(HYPHENATED_LANGUAGE_MAP).forEach(([locale, iso]) => {
  REVERSE_LANGUAGE_MAP[locale] = iso;
});

class Lint {
  async start(quiet?: boolean) {
    try {
      console.log('🔍 Linting translation files...');

      const config = selectors.getLocaleConfig();
      const localesPath = resolve(config.output);
      const isFolder = !config.entry.includes('.json') || config.entry.includes('*');

      if (isFolder) {
        console.log(`Running in ${chalk.bold.cyan('📂 Folder Mode')}`);
        await this.lintFolderMode(config, localesPath, quiet);
      } else {
        console.log(`Running in ${chalk.bold.cyan('📄 Flat Mode')}`);
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
