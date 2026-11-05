import { eld } from 'eld/large';

import type { LanguageDetectionResult } from '../types';

/**
 * 检测文本的语言
 */
export async function detectLanguage(text: string): Promise<LanguageDetectionResult> {
  if (!text?.trim()) {
    return {
      confidence: 0,
      detected: '',
      isReliable: false,
      scores: {},
    };
  }

  const result = eld.detect(text);
  const scores = result.getScores();
  const topScore = Math.max(...Object.values(scores));

  return {
    confidence: Math.min(topScore, 1), // 确保置信度不超过1
    detected: result.language,
    isReliable: result.isReliable(),
    scores,
  };
}

/**
 * 从完整的 locale 代码中提取主语言代码
 */
export function extractMainLanguageFromLocale(locale: string): string {
  // 处理下划线格式 (如 en_US -> en)
  if (locale.includes('_')) {
    const parts = locale.split('_');
    return parts[0] || locale;
  }
  // 处理连字符格式 (如 en-US -> en)
  if (locale.includes('-')) {
    const parts = locale.split('-');
    return parts[0] || locale;
  }
  // 直接返回语言代码
  return locale;
}
