export interface LintIssue {
  confidence?: number;
  detectedLanguage?: string;
  errorMessage?: string;
  expectedLanguage?: string;
  fieldPath?: string;
  key: string;
  lineNumber?: number;
  severity: 'error' | 'warning';
  text?: string;
  type: 'field_language_mismatch' | 'empty_string' | 'eld_error';
}

export interface LintResult {
  file: string;
  issues: LintIssue[];
}

export interface LanguageDetectionResult {
  confidence: number;
  detected: string;
  isReliable: boolean;
  scores: Record<string, number>;
}
