import { isPlainObject } from 'lodash-es';

import type { GlossaryEntry } from '@/prompts/translate';
import type { LocaleObj } from '@/types';
import type { Glossary } from '@/types/config';

export const MAX_EXAMPLES = 20;
const MAX_EXAMPLE_LENGTH = 120;
/** Examples unrelated to the chunk only carry tone, a few are enough. */
const MAX_UNRELATED_EXAMPLES = 5;

const WORD = /[\p{L}\p{N}]{3,}/gu;

const toWords = (text: string) => new Set(text.toLowerCase().match(WORD) ?? []);

const walkStrings = (
  obj: LocaleObj,
  visit: (path: string[], value: string) => void,
  path: string[] = [],
) => {
  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) walkStrings(value as LocaleObj, visit, [...path, key]);
    else if (typeof value === 'string') visit([...path, key], value);
  }
};

const getByPath = (obj: LocaleObj, path: string[]) => {
  let value: unknown = obj;
  for (const key of path) value = (value as LocaleObj | undefined)?.[key];
  return value;
};

/** `settings.title` and `{ settings: { title } }` both belong to `settings`. */
const toNamespace = (key?: string) => key?.split('.')[0];

export const collectText = (chunk: LocaleObj) => {
  const values: string[] = [];
  walkStrings(chunk, (_, value) => values.push(value));
  return values.join('\n');
};

/** Glossary terms that occur in the chunk, resolved for the target locale. */
export const pickGlossary = (
  glossary: Glossary | undefined,
  text: string,
  locale: string,
): GlossaryEntry[] => {
  if (!glossary) return [];
  const haystack = text.toLowerCase();
  const entries: GlossaryEntry[] = [];
  for (const [source, value] of Object.entries(glossary)) {
    const target = typeof value === 'string' ? value : value[locale];
    if (!target || !haystack.includes(source.toLowerCase())) continue;
    entries.push({ source, target });
  }
  return entries;
};

interface ExamplePair extends GlossaryEntry {
  namespace?: string;
  words: Set<string>;
}

/**
 * Indexes the already translated strings of a target file once, then picks per chunk the pairs
 * that share words or a top-level namespace with it.
 */
export const createExamplePicker = (entry: LocaleObj, target: LocaleObj) => {
  const pairs: ExamplePair[] = [];
  walkStrings(target, (path, translated) => {
    const source = getByPath(entry, path);
    if (typeof source !== 'string' || !source.trim() || !translated.trim()) return;
    if (source === translated || source.length > MAX_EXAMPLE_LENGTH) return;
    pairs.push({
      namespace: toNamespace(path[0]),
      source,
      target: translated,
      words: toWords(source),
    });
  });

  return (chunk: LocaleObj, limit = MAX_EXAMPLES): GlossaryEntry[] => {
    if (pairs.length === 0 || limit <= 0) return [];
    const namespaces = new Set(Object.keys(chunk).map(toNamespace));
    const words = toWords(collectText(chunk));

    const scored = pairs.map((pair, index) => {
      let overlap = 0;
      for (const word of pair.words) if (words.has(word)) overlap++;
      const score = overlap * 2 + (pair.namespace && namespaces.has(pair.namespace) ? 1 : 0);
      return { index, pair, score };
    });
    scored.sort((a, b) => b.score - a.score || a.index - b.index);

    const picked: GlossaryEntry[] = [];
    let unrelated = 0;
    for (const { pair, score } of scored) {
      if (picked.length >= limit) break;
      if (score === 0 && ++unrelated > MAX_UNRELATED_EXAMPLES) break;
      picked.push({ source: pair.source, target: pair.target });
    }
    return picked;
  };
};
