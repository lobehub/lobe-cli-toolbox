import { CONFIDENCE_THRESHOLDS } from '../constants';
import type { LintIssue } from '../types';
import { findLineNumber } from './fileUtils';
import { detectLanguage } from './languageDetection';
import {
  createELDErrorIssue,
  createEmptyStringIssue,
  createLanguageMismatchIssue,
  isSimilarLanguage,
} from './languageValidation';

const checkString = async (
  fieldPath: string,
  value: string,
  mainLanguage: string,
  filePath: string,
  threshold: number,
): Promise<LintIssue | undefined> => {
  if (value.trim() === '')
    return createEmptyStringIssue(fieldPath, findLineNumber(filePath, fieldPath, value));

  try {
    const { confidence, detected } = await detectLanguage(value);
    if (!detected || detected === mainLanguage || confidence <= threshold) return;
    // 跳过相似语言的低置信度检测
    if (isSimilarLanguage(mainLanguage, detected, confidence)) return;

    return createLanguageMismatchIssue(
      fieldPath,
      detected,
      mainLanguage,
      confidence,
      value,
      findLineNumber(filePath, fieldPath, value),
    );
  } catch (error) {
    return createELDErrorIssue(
      fieldPath,
      error instanceof Error ? error.message : 'Unknown error',
      findLineNumber(filePath, fieldPath, value),
    );
  }
};

/**
 * 递归检查对象中字段的语言
 */
export async function checkFieldLanguages(
  obj: any,
  path: string = '',
  mainLanguage: string,
  filePath: string,
): Promise<LintIssue[]> {
  const issues: LintIssue[] = [];
  const push = (issue?: LintIssue) => issue && issues.push(issue);

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      push(await checkString(currentPath, value, mainLanguage, filePath, 0.5));
    } else if (Array.isArray(value)) {
      for (const [i, element] of value.entries()) {
        if (typeof element !== 'string') continue;
        push(
          await checkString(
            `${currentPath}[${i}]`,
            element,
            mainLanguage,
            filePath,
            CONFIDENCE_THRESHOLDS.ARRAY_TEXT,
          ),
        );
      }
    } else if (typeof value === 'object' && value !== null) {
      issues.push(...(await checkFieldLanguages(value, currentPath, mainLanguage, filePath)));
    }
  }

  return issues;
}
