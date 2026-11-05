import { isPlainObject } from 'lodash-es';

import type { LocaleObj } from '@/types';

import { setByPath } from './setByPath';

export type KeyPath = string[];

const THINK_BLOCK = /^\s*<think>[\s\S]*?<\/think>\s*/i;
const FENCED = /^\s*```[\w-]*[^\S\n]*\n([\s\S]*?)\n?```\s*$/;

/** Reasoning models may prefix the answer with a `<think>` block. */
export const stripThinking = (text: string) => text.replace(THINK_BLOCK, '');

/**
 * Takes the JSON object out of a model reply that may be wrapped in a code fence or surrounded
 * by prose.
 */
export const extractJsonText = (text: string): string => {
  const cleaned = stripThinking(text).trim();
  const fenced = cleaned.match(FENCED)?.[1] ?? cleaned;
  const start = fenced.indexOf('{');
  const end = fenced.lastIndexOf('}');
  return start !== -1 && end > start ? fenced.slice(start, end + 1) : fenced;
};

/** Removes a code fence the model wrapped around the whole document, unless the source had one. */
export const cleanMarkdownOutput = (text: string, source: string): string => {
  const cleaned = stripThinking(text);
  if (FENCED.test(source)) return cleaned;
  return cleaned.match(FENCED)?.[1] ?? cleaned;
};

const PLACEHOLDER_PATTERNS: RegExp[] = [
  // i18next / handlebars: {{name}}, {{- name}}, {{count, number}}
  /\{\{[^{}]+\}\}/g,
  // ICU argument header: {count, plural, ...}; the branch texts are translated
  /\{\s*\w+\s*,\s*(?:plural|select|selectordinal|number|date|time)\b/g,
  // ICU / vue-i18n simple argument: {name}, {0}
  /\{\s*[\w.]+\s*\}/g,
  // printf: %s, %d, %1$s, %@
  /%(?:\d+\$)?[@dfis]/g,
  // i18next nesting: $t(key)
  /\$t\([^)]*\)/g,
  // HTML / react-i18next tags: <b>, </b>, <0>, <br/>
  /<\/?(?:[A-Z][\w.-]*|\d+)(?:\s[^<>]*)?\/?>/gi,
];

/** Tags compare by name only, attribute values such as `title` may be translated. */
const normalizeTag = (tag: string) => {
  const close = tag.startsWith('</') ? '/' : '';
  const name = tag.slice(close ? 2 : 1).match(/^[\w.-]+/)?.[0] ?? '';
  const selfClose = tag.endsWith('/>') ? '/' : '';
  return `<${close}${name}${selfClose}>`;
};

const normalizeToken = (token: string) =>
  token.startsWith('<') ? normalizeTag(token) : token.replaceAll(/\s+/g, '');

/** Placeholders and tags that must survive translation, sorted so they compare as a multiset. */
export const extractPlaceholders = (text: string): string[] => {
  let rest = text;
  const tokens: string[] = [];
  for (const pattern of PLACEHOLDER_PATTERNS) {
    rest = rest.replaceAll(pattern, (match) => {
      tokens.push(normalizeToken(match));
      return ' ';
    });
  }
  return tokens.sort();
};

export const hasSamePlaceholders = (source: string, output: string) => {
  const a = extractPlaceholders(source);
  const b = extractPlaceholders(output);
  return a.length === b.length && a.every((token, index) => token === b[index]);
};

export interface AlignResult {
  /** Keys whose translation broke a placeholder or tag. */
  invalid: KeyPath[];
  /** Keys absent from the output, or with a value of the wrong type. */
  missing: KeyPath[];
  /** Only the keys of the source, extra keys from the model are dropped. */
  result: LocaleObj;
}

/**
 * Projects the model output onto the shape of the source chunk and reports every key that has
 * to be translated again.
 */
export const alignToSource = (source: LocaleObj, output: unknown): AlignResult => {
  const aligned: AlignResult = { invalid: [], missing: [], result: {} };

  const walk = (src: LocaleObj, out: unknown, path: KeyPath) => {
    const outObj = isPlainObject(out) ? (out as LocaleObj) : undefined;
    for (const [key, value] of Object.entries(src)) {
      const keyPath = [...path, key];
      const translated = outObj?.[key];

      if (isPlainObject(value)) {
        walk(value as LocaleObj, translated, keyPath);
        continue;
      }

      if (typeof value !== 'string') {
        if (
          Array.isArray(value) &&
          Array.isArray(translated) &&
          translated.length === value.length
        ) {
          setByPath(aligned.result, keyPath, translated);
        } else if (Array.isArray(value)) {
          aligned.missing.push(keyPath);
        } else {
          // numbers, booleans and null are not translatable
          setByPath(aligned.result, keyPath, value);
        }
        continue;
      }

      if (typeof translated !== 'string' || (value.trim() !== '' && translated.trim() === '')) {
        aligned.missing.push(keyPath);
        continue;
      }

      if (!hasSamePlaceholders(value, translated)) {
        aligned.invalid.push(keyPath);
        continue;
      }

      setByPath(aligned.result, keyPath, translated);
    }
  };

  walk(source, output, []);
  return aligned;
};

/** Builds the sub-object of `source` that contains only `paths`. */
export const pickPaths = (source: LocaleObj, paths: KeyPath[]): LocaleObj => {
  const picked: LocaleObj = {};
  for (const path of paths) {
    let value: unknown = source;
    for (const key of path) value = (value as LocaleObj | undefined)?.[key];
    if (value !== undefined) setByPath(picked, path, value);
  }
  return picked;
};

export const formatKeyPath = (path: KeyPath) => path.join('.');
