import { CONFIDENCE_THRESHOLDS } from '../constants';
import { LintIssue } from '../types';
import { findLineNumber } from './fileUtils';
import { detectLanguage } from './languageDetection';
import {
  createELDErrorIssue,
  createEmptyStringIssue,
  createLanguageMismatchIssue,
  isSimilarLanguage,
} from './languageValidation';

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

  for (const [key, value] of Object.entries(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    if (typeof value === 'string') {
      if (value.trim().length > 0) {
        // 检查空字符串
        if (value.trim() === '') {
          const lineNumber = findLineNumber(filePath, currentPath, value);
          issues.push(createEmptyStringIssue(currentPath, lineNumber));
          continue;
        }

        // 对字符串进行语言检测
        try {
          const fieldDetection = await detectLanguage(value);
          const fieldDetectedLanguage = fieldDetection.detected;
          const fieldConfidence = fieldDetection.confidence;

          if (
            fieldDetectedLanguage &&
            fieldDetectedLanguage !== mainLanguage &&
            fieldConfidence > 0.5
          ) {
            // 检查是否为相似语言
            if (isSimilarLanguage(mainLanguage, fieldDetectedLanguage, fieldConfidence)) {
              continue; // 跳过相似语言的低置信度检测
            }

            const lineNumber = findLineNumber(filePath, currentPath, value);
            issues.push(
              createLanguageMismatchIssue(
                currentPath,
                fieldDetectedLanguage,
                mainLanguage,
                fieldConfidence,
                value,
                lineNumber,
              ),
            );
          }
        } catch (eldError) {
          const lineNumber = findLineNumber(filePath, currentPath, value);
          issues.push(
            createELDErrorIssue(
              currentPath,
              eldError instanceof Error ? eldError.message : 'Unknown error',
              lineNumber,
            ),
          );
        }
      }
    } else if (Array.isArray(value)) {
      // 处理数组中的字符串
      for (const [i, element] of value.entries()) {
        const arrayPath = `${currentPath}[${i}]`;
        if (typeof element === 'string' && element.trim().length > 0) {
          // 检查空字符串
          if (element.trim() === '') {
            const lineNumber = findLineNumber(filePath, arrayPath, element);
            issues.push(createEmptyStringIssue(arrayPath, lineNumber));
            continue;
          }

          // 对数组中的字符串进行语言检测
          try {
            const fieldDetection = await detectLanguage(element);
            const fieldDetectedLanguage = fieldDetection.detected;
            const fieldConfidence = fieldDetection.confidence;

            if (
              fieldDetectedLanguage &&
              fieldDetectedLanguage !== mainLanguage &&
              fieldConfidence > CONFIDENCE_THRESHOLDS.ARRAY_TEXT
            ) {
              // 检查是否为相似语言
              if (isSimilarLanguage(mainLanguage, fieldDetectedLanguage, fieldConfidence)) {
                continue; // 跳过相似语言的低置信度检测
              }

              const lineNumber = findLineNumber(filePath, arrayPath, element);
              issues.push(
                createLanguageMismatchIssue(
                  arrayPath,
                  fieldDetectedLanguage,
                  mainLanguage,
                  fieldConfidence,
                  element,
                  lineNumber,
                ),
              );
            }
          } catch (eldError) {
            const lineNumber = findLineNumber(filePath, arrayPath, element);
            issues.push(
              createELDErrorIssue(
                arrayPath,
                eldError instanceof Error ? eldError.message : 'Unknown error',
                lineNumber,
              ),
            );
          }
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      // 递归检查嵌套对象
      const nestedIssues = await checkFieldLanguages(value, currentPath, mainLanguage, filePath);
      issues.push(...nestedIssues);
    }
  }

  return issues;
}
