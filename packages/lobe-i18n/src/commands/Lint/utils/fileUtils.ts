import { resolve } from 'node:path';

import { LintIssue } from '../types';

/**
 * 查找字段在文件中的行号
 */
export function findLineNumber(
  filePath: string,
  fieldPath: string,
  value: string,
): number | undefined {
  try {
    const fs = require('node:fs');
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // 构建搜索模式
    const searchPattern = new RegExp(
      `"${fieldPath.split('.').pop()}"\\s*:\\s*"${value.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&')}"`,
    );

    for (const [i, line] of lines.entries()) {
      if (searchPattern.test(line)) {
        return i + 1; // 返回1-based行号
      }
    }

    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * 处理单个文件的lint检查
 */
export async function processLintFile(
  filePath: string,
  expectedLanguage: string,
  checkFieldLanguages: (
    obj: any,
    path: string,
    mainLanguage: string,
    filePath: string,
  ) => Promise<LintIssue[]>,
): Promise<LintIssue[]> {
  try {
    const fs = require('node:fs');
    const content = fs.readFileSync(filePath, 'utf8');
    const localeObj = JSON.parse(content);

    // 提取主语言代码
    const { extractMainLanguageFromLocale } = await import('./languageDetection');
    const mainLanguage = extractMainLanguageFromLocale(expectedLanguage);

    // 检查字段级别的语言
    const fieldIssues = await checkFieldLanguages(localeObj, '', mainLanguage, filePath);

    return fieldIssues;
  } catch (error) {
    return [
      {
        errorMessage: `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key: 'file_error',
        severity: 'error',
        type: 'eld_error',
      },
    ];
  }
}

/**
 * 获取相对路径
 */
export function getRelativePath(filePath: string): string {
  return filePath.replace(process.cwd() + '/', '');
}

/**
 * 获取绝对路径
 */
export function getAbsolutePath(filePath: string): string {
  return resolve(filePath);
}
