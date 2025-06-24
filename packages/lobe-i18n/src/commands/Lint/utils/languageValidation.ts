import {
  ARABIC_SIMILAR_LANGUAGES,
  CONFIDENCE_THRESHOLDS,
  ENGLISH_TERMS,
  LANGUAGE_FAMILIES,
} from '../constants';
import { LintIssue } from '../types';

/**
 * 检查是否为相似语言（基于语言族系）
 */
export function isSimilarLanguage(
  mainLanguage: string,
  detectedLanguage: string,
  confidence: number,
): boolean {
  // 特殊处理：阿拉伯语与波斯语、乌尔都语、库尔德语相似
  if (
    ARABIC_SIMILAR_LANGUAGES.has(mainLanguage) &&
    ARABIC_SIMILAR_LANGUAGES.has(detectedLanguage) &&
    confidence < CONFIDENCE_THRESHOLDS.ARABIC_SIMILAR
  ) {
    return true;
  }

  // 检查各种语言族系
  for (const family of Object.values(LANGUAGE_FAMILIES)) {
    if (
      family.has(mainLanguage) &&
      family.has(detectedLanguage) &&
      confidence < CONFIDENCE_THRESHOLDS.SIMILAR_LANGUAGES
    ) {
      return true;
    }
  }

  // 特殊处理：他加禄语与西班牙语、葡萄牙语相似
  if (
    mainLanguage === 'tl' &&
    ['es', 'pt'].includes(detectedLanguage) &&
    confidence < CONFIDENCE_THRESHOLDS.SIMILAR_LANGUAGES
  ) {
    return true;
  }

  return false;
}

/**
 * 检查是否包含明显英文内容
 */
export function containsEnglishTerms(text: string): boolean {
  return ENGLISH_TERMS.some((term) => text.includes(term));
}

/**
 * 确定问题严重程度
 */
export function determineSeverity(
  textLength: number,
  confidence: number,
  detectedLanguage: string,
  mainLanguage: string,
  text: string,
): 'error' | 'warning' {
  // 对于短文本（<=3），置信度低于0.7时只报 warning
  let severity: 'error' | 'warning' =
    textLength <= 3
      ? confidence > CONFIDENCE_THRESHOLDS.SHORT_TEXT
        ? 'error'
        : 'warning'
      : confidence > CONFIDENCE_THRESHOLDS.LONG_TEXT
        ? 'error'
        : 'warning';

  // 如果是东亚语言和其他语系的混用，判定为 error
  const isDetectedEastAsian = LANGUAGE_FAMILIES.EAST_ASIAN.has(detectedLanguage);
  const isMainEastAsian = LANGUAGE_FAMILIES.EAST_ASIAN.has(mainLanguage);

  if (isDetectedEastAsian !== isMainEastAsian && confidence > 0.5) {
    return 'error';
  }

  // 检测明显英文内容的逻辑
  if (
    detectedLanguage === 'en' &&
    mainLanguage !== 'en' &&
    containsEnglishTerms(text) &&
    confidence > 0.5
  ) {
    severity = 'error'; // 明显英文内容直接设为error
  }

  return severity;
}

/**
 * 创建语言不匹配问题
 */
export function createLanguageMismatchIssue(
  fieldPath: string,
  detectedLanguage: string,
  mainLanguage: string,
  confidence: number,
  text: string,
  lineNumber?: number,
): LintIssue {
  const severity = determineSeverity(
    text.trim().length,
    confidence,
    detectedLanguage,
    mainLanguage,
    text,
  );

  return {
    confidence,
    detectedLanguage,
    expectedLanguage: mainLanguage,
    fieldPath,
    key: 'field_language_mismatch',
    lineNumber,
    severity,
    text,
    type: 'field_language_mismatch',
  };
}

/**
 * 创建空字符串问题
 */
export function createEmptyStringIssue(fieldPath: string, lineNumber?: number): LintIssue {
  return {
    fieldPath,
    key: 'empty_string',
    lineNumber,
    severity: 'warning',
    type: 'empty_string',
  };
}

/**
 * 创建ELD错误问题
 */
export function createELDErrorIssue(
  fieldPath: string,
  errorMessage: string,
  lineNumber?: number,
): LintIssue {
  return {
    errorMessage,
    fieldPath,
    key: 'eld_error',
    lineNumber,
    severity: 'warning',
    type: 'eld_error',
  };
}
