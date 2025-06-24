import chalk from 'chalk';
import { consola } from 'consola';

import { LintResult } from '../types';
import { getAbsolutePath, getRelativePath } from './fileUtils';

/**
 * 显示单个问题
 */
function displayIssue(issue: any, absolutePath: string): void {
  const severityText = issue.severity === 'error' ? chalk.red('error') : chalk.yellow('warning');
  // 使用固定宽度：error(5字符) + 3空格 = 8，warning(7字符) + 1空格 = 8
  const paddedSeverity =
    issue.severity === 'error'
      ? severityText + '   ' // error 后面加 3 个空格
      : severityText + ' '; // warning 后面加 1 个空格
  const lineNumber = issue.lineNumber?.toString().padStart(4, ' ') || '';

  // 根据问题类型格式化消息
  let formattedMessage = '';

  switch (issue.type) {
    case 'field_language_mismatch': {
      const languageDiff = `${chalk.green(issue.expectedLanguage!)} → ${chalk.red(issue.detectedLanguage!)}`;
      // 根据置信度给置信度文本添加颜色
      const confidenceText = issue.confidence
        ? chalk.gray(`(confidence ${(issue.confidence * 100).toFixed(0)}%)`)
        : '';

      // 创建字段路径的链接（指向具体行）
      const fieldPathLink = issue.lineNumber
        ? `file://${absolutePath}:${issue.lineNumber}`
        : `file://${absolutePath}`;

      // 使用 ANSI 转义序列创建超链接
      const clickableFieldPath = `\u001B]8;;${fieldPathLink}\u0007${issue.fieldPath}\u001B]8;;\u0007`;

      formattedMessage =
        `${languageDiff} at ${chalk.cyan(clickableFieldPath)}: ${chalk.white(`"${issue.text}"`)} ${confidenceText}`.trim();
      break;
    }

    case 'empty_string': {
      // 创建字段路径的链接
      const fieldPathLink = issue.lineNumber
        ? `file://${absolutePath}:${issue.lineNumber}`
        : `file://${absolutePath}`;

      // 使用 ANSI 转义序列创建超链接
      const clickableFieldPath = `\u001B]8;;${fieldPathLink}\u0007${issue.fieldPath}\u001B]8;;\u0007`;

      formattedMessage = `Empty string at ${chalk.cyan(clickableFieldPath)}`;
      break;
    }

    case 'eld_error': {
      // 创建字段路径的链接
      const fieldPathLink = issue.lineNumber
        ? `file://${absolutePath}:${issue.lineNumber}`
        : `file://${absolutePath}`;

      // 使用 ANSI 转义序列创建超链接
      const clickableFieldPath = `\u001B]8;;${fieldPathLink}\u0007${issue.fieldPath}\u001B]8;;\u0007`;

      formattedMessage = `Detection failed at ${chalk.cyan(clickableFieldPath)}: ${chalk.red(issue.errorMessage!)}`;
      break;
    }
  }

  // 输出格式：6:1  error   bg → be at 'tab.home': "Начална страница" (confidence 85%)
  const output = `${chalk.gray(`${lineNumber}:1`)}  ${paddedSeverity}  ${formattedMessage}`;

  console.log(output);
}

/**
 * 显示lint结果
 */
export function displayResults(results: LintResult[], quiet?: boolean): void {
  if (results.length === 0) {
    consola.success('✅ All translation files passed linting!');
    return;
  }

  // 统计错误和警告数量
  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    for (const issue of result.issues) {
      if (issue.severity === 'error') {
        errorCount++;
      } else if (!quiet) {
        // 在quiet模式下不统计警告
        warningCount++;
      }
    }
  }

  // 在quiet模式下，如果没有错误，显示成功消息
  if (quiet && errorCount === 0) {
    consola.success('✅ No errors found in translation files!');
    return;
  }

  // 显示统计信息
  const totalIssues = errorCount + warningCount;
  const summary = [];
  if (errorCount > 0) summary.push(chalk.red(`${errorCount} error${errorCount !== 1 ? 's' : ''}`));
  if (warningCount > 0)
    summary.push(chalk.yellow(`${warningCount} warning${warningCount !== 1 ? 's' : ''}`));

  console.log(
    `${chalk.bold('✖')} ${totalIssues} problem${totalIssues !== 1 ? 's' : ''} (${summary.join(', ')})`,
  );

  // 按文件分组显示问题
  for (const result of results) {
    const relativePath = getRelativePath(result.file);
    const absolutePath = getAbsolutePath(result.file);

    // 过滤该文件的问题（在quiet模式下只显示错误）
    const filteredIssues = quiet
      ? result.issues.filter((issue) => issue.severity === 'error')
      : result.issues;

    // 如果该文件在过滤后没有问题，跳过
    if (filteredIssues.length === 0) continue;

    // 显示文件路径（可点击）
    console.log(`\n${chalk.white.underline(relativePath)}`);

    // 显示该文件的所有问题
    for (const issue of filteredIssues) {
      displayIssue(issue, absolutePath);
    }
  }

  // 显示总结（不换行）
  if (errorCount > 0) {
    consola.error(
      `${chalk.bold.red('✖')} Found ${errorCount} error${errorCount !== 1 ? 's' : ''}`,
    );
  }
  if (warningCount > 0) {
    consola.warn(
      `${chalk.bold.yellow('⚠')} Found ${warningCount} warning${warningCount !== 1 ? 's' : ''}`,
    );
  }
}
