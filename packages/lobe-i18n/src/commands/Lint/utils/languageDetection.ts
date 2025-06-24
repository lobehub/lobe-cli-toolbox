import { eld } from '@yutengjing/eld';

import { LanguageDetectionResult } from '../types';

// 语言检测器初始化Promise，确保只初始化一次
let initPromise: Promise<void> | null = null;

/**
 * 初始化 ELD 语言检测器
 */
export async function initializeELD(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      console.log('🔧 Initializing ELD language detector...');
      await eld.init('L'); // 使用中等规模的数据集
      console.log('✅ ELD language detector initialized');
    })();
  }
  return initPromise;
}

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

  // 确保 ELD 已初始化
  await initializeELD();

  const result = eld.detect(text);
  const scores = result.getScores();
  const topScore = Math.max(...Object.values(scores));

  return {
    confidence: Math.min(topScore, 1), // 确保置信度不超过1
    detected: result.language,
    isReliable: result.isReliable(),
    scores: scores,
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
