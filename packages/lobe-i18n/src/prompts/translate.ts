import { ChatPromptTemplate } from 'langchain/prompts';

const DEFAULT_REFERENCE =
  'You can adjust the tone and style, taking into account the cultural connotations and regional differences of certain words. As a translator, you need to translate the original text into a translation that meets the standards of accuracy and elegance. "Accuracy" means being faithful to the content and intent of the original text; "elegance" means that the translation should be clear and easy to understand, with a clear expression; "elegance" pursues the cultural aesthetics of the translation and the beauty of the language. The goal is to create a translation that is both faithful to the spirit of the original work and conforms to the target language and reader\'s aesthetic preferences.';
export const promptJsonTranslate = (reference: string = DEFAULT_REFERENCE) => {
  return ChatPromptTemplate.fromPromptMessages<{
    from: string;
    json: string;
    to: string;
  }>([
    [
      'system',
      [
        `Translate the i18n JSON file from {from} to {to} according to the BCP 47 standard`,
        `Here are some reference to help with better translation.  ---${reference}---`,
        `Keep the keys the same as the original file and make sure the output remains a valid i18n JSON file.`,
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    ['human', '{json}'],
  ]);
};

export const promptStringTranslate = (reference: string = DEFAULT_REFERENCE) => {
  return ChatPromptTemplate.fromPromptMessages<{
    from: string;
    text: string;
    to: string;
  }>([
    [
      'system',
      [
        `Translate the markdown file from {from} to {to} according to the BCP 47 standard`,
        `Here are some reference to help with better translation.  ---${reference}---`,
        `Make sure the output remains a valid markdown file.`,
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    ['human', '{text}'],
  ]);
};
