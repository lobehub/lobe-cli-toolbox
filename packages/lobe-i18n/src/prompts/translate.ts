import type { ChatMessage } from '@lobehub/cli-common/llm';

import { getLocaleName } from '@/utils/localeName';

export interface GlossaryEntry {
  source: string;
  target: string;
}

export interface TranslateContext {
  /** Already translated `source → target` pairs of the project, for consistent terminology. */
  examples?: GlossaryEntry[];
  from: string;
  glossary?: GlossaryEntry[];
  reference?: string;
  /** Feedback for a retry, e.g. which keys broke their placeholders. */
  retryHint?: string;
  to: string;
}

const formatPairs = (pairs: GlossaryEntry[]) =>
  pairs.map(({ source, target }) => `- ${JSON.stringify(source)} → ${JSON.stringify(target)}`);

const contextSection = ({ examples, glossary, reference, retryHint }: TranslateContext) =>
  [
    reference && ['', '## Project context', reference],
    glossary?.length && [
      '',
      '## Glossary',
      'Always translate these terms exactly as listed (a term mapped to itself must stay untranslated):',
      ...formatPairs(glossary),
    ],
    examples?.length && [
      '',
      '## Existing translations',
      'Approved translations from this project. Follow their terminology, tone and formatting:',
      ...formatPairs(examples),
    ],
    retryHint && ['', '## Fix from the previous attempt', retryHint],
  ]
    .filter(Boolean)
    .flat() as string[];

export const buildJsonTranslateMessages = (
  context: TranslateContext & { json: string },
): ChatMessage[] => {
  const from = getLocaleName(context.from);
  const to = getLocaleName(context.to);
  return [
    {
      content: [
        `You are a professional software localization translator. Translate the values of an i18n JSON object from ${from} to ${to}.`,
        '',
        '## Rules',
        '- Keep every key and the nesting exactly as in the input. Never translate, add, drop or reorder keys.',
        '- Translate only string values. Keep numbers, booleans and null unchanged.',
        '- Keep interpolation placeholders and markup byte for byte: `{{name}}`, `{name}`, `{0}`, `%s`, `%d`, `$t(key)`, `<0>`, `<b>`, `</b>`, `<br/>`.',
        '- For ICU messages such as `{count, plural, one {# file} other {# files}}`, keep the argument name, the keywords (`plural`, `select`, `one`, `other`, `=0`, ...) and `#`; translate only the text inside the branches, and use the plural categories of the target language.',
        '- Do not translate brand or product names, code, URLs, e-mail addresses, file paths or keyboard shortcuts.',
        '- Keep leading and trailing whitespace, `\\n` line breaks and the meaning of punctuation; use the punctuation conventions of the target language.',
        '- Write concise, natural text that fits a software UI. Use the key names as context for meaning (e.g. button labels, titles, tooltips) and keep terminology consistent.',
        '- If a value is already in the target language or must not be translated, return it unchanged.',
        ...contextSection(context),
        '',
        '## Output',
        'Return only the translated JSON object: valid JSON, no code fences, no comments, no explanations.',
      ].join('\n'),
      role: 'system',
    },
    { content: context.json, role: 'user' },
  ];
};

export const buildMarkdownTranslateMessages = (
  context: TranslateContext & { text: string },
): ChatMessage[] => {
  const from = getLocaleName(context.from);
  const to = getLocaleName(context.to);
  return [
    {
      content: [
        `You are a professional technical translator. Translate the Markdown document from ${from} to ${to}.`,
        '',
        '## Rules',
        '- The input may be one part of a longer document. Translate it as it is, never summarize, complete or add content.',
        '- Keep the Markdown structure exactly: headings, lists, tables, blockquotes, emphasis, line breaks, blank lines and indentation.',
        '- Do not translate code blocks, inline code, URLs, link and image targets, reference labels, HTML / JSX tag and attribute names, or import / export statements.',
        '- Translate human readable text, including link text, image alt text, table cells and string attributes such as `title`.',
        '- Keep placeholders such as `{{name}}`, `{name}` and `%s`, and GitHub alerts such as `[!NOTE]`, unchanged.',
        '- Do not translate brand or product names. Write natural, fluent text that reads as if originally written in the target language.',
        ...contextSection(context),
        '',
        '## Output',
        'Return only the translated Markdown. Do not wrap it in a code block and do not add explanations.',
      ].join('\n'),
      role: 'system',
    },
    { content: context.text, role: 'user' },
  ];
};
