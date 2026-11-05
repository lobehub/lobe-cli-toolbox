import { type ChatMessage, LLMClient } from '@lobehub/cli-common/llm';
import type { ResolvedProviderConfig } from '@lobehub/cli-common/providers';
// @ts-ignore
import dJSON from 'dirty-json';
import { merge } from 'lodash-es';

import {
  buildJsonTranslateMessages,
  buildMarkdownTranslateMessages,
  type GlossaryEntry,
} from '@/prompts/translate';
import type { LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import { collectText, pickGlossary } from '@/utils/translateContext';
import {
  type AlignResult,
  alignToSource,
  cleanMarkdownOutput,
  extractJsonText,
  formatKeyPath,
  type KeyPath,
  pickPaths,
} from '@/utils/translateOutput';

/** First attempt plus one retry limited to the keys that came back missing or broken. */
const MAX_ATTEMPTS = 2;
const MAX_HINT_KEYS = 30;

export interface JsonTranslateResult {
  /** Keys that are still missing or broken after every attempt, they are left untranslated. */
  failed: KeyPath[];
  result: LocaleObj;
  tokenUsage: number;
}

export interface StringTranslateResult {
  result: string;
  tokenUsage: number;
}

const parseJson = (text: string): unknown => {
  const json = extractJsonText(text);
  try {
    return JSON.parse(json);
  } catch {
    try {
      return dJSON.parse(json);
    } catch {
      return undefined;
    }
  }
};

const listKeys = (paths: KeyPath[]) => {
  const keys = paths.slice(0, MAX_HINT_KEYS).map((path) => `\`${formatKeyPath(path)}\``);
  if (paths.length > MAX_HINT_KEYS) keys.push(`and ${paths.length - MAX_HINT_KEYS} more`);
  return keys.join(', ');
};

const buildRetryHint = ({ invalid, missing }: AlignResult) =>
  [
    missing.length > 0 &&
      `These keys were missing or empty in your previous answer, translate every key: ${listKeys(missing)}.`,
    invalid.length > 0 &&
      `These keys changed, dropped or added placeholders or tags, keep them exactly as in the source: ${listKeys(invalid)}.`,
  ]
    .filter(Boolean)
    .join('\n');

export class TranslateLocale {
  client: LLMClient;
  private config: I18nConfig;
  private isJsonMode: boolean;

  constructor(config: I18nConfig, provider: ResolvedProviderConfig) {
    this.config = config;
    this.client = new LLMClient(provider);
    this.isJsonMode = Boolean(this.config?.experimental?.jsonMode);
  }

  async runByString({
    from,
    to,
    text,
  }: {
    from?: string;
    text: string;
    to: string;
  }): Promise<StringTranslateResult> {
    const messages = buildMarkdownTranslateMessages({
      from: from || this.config.entryLocale,
      glossary: pickGlossary(this.config.glossary, text, to),
      reference: this.config.reference,
      text,
      to,
    });

    const { text: output, totalTokens } = await this.generate(messages);
    const result = cleanMarkdownOutput(output, text);
    if (!result.trim()) throw new Error('The model returned an empty translation');

    return { result, tokenUsage: totalTokens };
  }

  async runByJson({
    examples,
    from,
    to,
    json,
  }: {
    examples?: GlossaryEntry[];
    from?: string;
    json: LocaleObj;
    to: string;
  }): Promise<JsonTranslateResult> {
    const result: LocaleObj = {};
    let pending = json;
    let failed: KeyPath[] = [];
    let retryHint: string | undefined;
    let tokenUsage = 0;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const messages = buildJsonTranslateMessages({
        examples,
        from: from || this.config.entryLocale,
        glossary: pickGlossary(this.config.glossary, collectText(pending), to),
        json: JSON.stringify(pending),
        reference: this.config.reference,
        retryHint,
        to,
      });

      const { text, totalTokens } = await this.generate(messages, this.isJsonMode);
      tokenUsage += totalTokens;

      const aligned = alignToSource(pending, parseJson(text));
      merge(result, aligned.result);
      failed = [...aligned.missing, ...aligned.invalid];
      if (failed.length === 0) break;

      pending = pickPaths(json, failed);
      retryHint = buildRetryHint(aligned);
    }

    return { failed, result, tokenUsage };
  }

  private async generate(messages: ChatMessage[], json?: boolean) {
    const { text, totalTokens } = await this.client.generate({
      json,
      messages,
      temperature: this.config.temperature,
      topP: this.config.topP,
    });
    const output = text ?? '';
    return {
      text: output,
      totalTokens: totalTokens ?? calcToken(JSON.stringify(messages)) + calcToken(output),
    };
  }
}
