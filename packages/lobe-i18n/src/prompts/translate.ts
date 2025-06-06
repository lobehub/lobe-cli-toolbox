import { ChatPromptTemplate } from '@/utils/promptTemplate';

const DEFAULT_REFERENCE =
  'You can adjust the tone and style, taking into account the cultural connotations and regional differences of certain words. As a translator, you need to translate the original text into a translation that meets the standards of accuracy and elegance.';

export const promptJsonTranslate = (reference: string = DEFAULT_REFERENCE) => {
  return ChatPromptTemplate.fromMessages<{
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
        `Do not include any additional text or explanations outside the JSON object.Start directly with a left brace and end with a right brace.`,
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    ['user', '{json}'],
  ]);
};

export const promptStringTranslate = (reference: string = DEFAULT_REFERENCE) => {
  return ChatPromptTemplate.fromMessages<{
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
    ['user', '{text}'],
  ]);
};
