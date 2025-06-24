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
  // 默认为 warning
  let severity: 'error' | 'warning' = 'warning';

  // 规则1：对于长文本，如果置信度足够高，则为 error
  if (textLength > 3 && confidence > CONFIDENCE_THRESHOLDS.LONG_TEXT) {
    severity = 'error';
  }

  // 规则2：对于短文本，如果置信度足够高，则为 error
  if (textLength <= 3 && confidence > CONFIDENCE_THRESHOLDS.SHORT_TEXT) {
    severity = 'error';
  }

  // 规则3：检测到东亚语言和其他语系混用，则为 error
  const isDetectedEastAsian = LANGUAGE_FAMILIES.EAST_ASIAN.has(detectedLanguage);
  const isMainEastAsian = LANGUAGE_FAMILIES.EAST_ASIAN.has(mainLanguage);
  if (isDetectedEastAsian !== isMainEastAsian && confidence > 0.5) {
    severity = 'error';
  }

  // 规则4：如果主语言和检测语言不属于同一个语系，则为 error
  const mainFamily = Object.values(LANGUAGE_FAMILIES).find((family) => family.has(mainLanguage));
  const detectedFamily = Object.values(LANGUAGE_FAMILIES).find((family) =>
    family.has(detectedLanguage),
  );
  if (mainFamily && detectedFamily && mainFamily !== detectedFamily && confidence > 0.6) {
    severity = 'error';
  }

  // 规则5：检测到明显英文内容，则为 error
  if (
    detectedLanguage === 'en' &&
    mainLanguage !== 'en' &&
    containsEnglishTerms(text) &&
    confidence > 0.5
  ) {
    severity = 'error';
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
