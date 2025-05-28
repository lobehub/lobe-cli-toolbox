import gitmojis from '@/constants/gitmojis';
import { selectors } from '@/store';

import { ChatPromptTemplate, PromptTemplate } from '../../../common/promptTemplate';

const BASE_PROMPT =
  `You are to act as the author of a commit message in git. Your mission is to create clean and comprehensive commit messages in the conventional commit convention and explain WHAT were the changes and WHY the changes were done.` +
  `I'll enter a git diff summary, and your job is to convert it into a useful commit message.` +
  `Add a short description of the changes are done after the commit message. Don't start it with "This commit", just describe the changes.` +
  `Use the present tense. Lines must not be longer than 74 characters.`;

const TYPES_EXAMPLE = gitmojis.map((item) => `- ${item.type}: ${item.desc}`).join('\n');

const PROMPT = selectors.getConfig('prompt') || BASE_PROMPT;
const LOCALE = selectors.getConfig('locale');
const MAX_LENGTH = selectors.getConfig('maxLength');

export const promptCommits = () => {
  return ChatPromptTemplate.fromMessages<{
    summary: string;
  }>([
    [
      'system',
      [
        PROMPT,
        `## Rules`,
        `- Choose only 1 type from the type-to-description below: <${TYPES_EXAMPLE}>`,
        `- Commit message must be a maximum of ${MAX_LENGTH} characters.`,
        LOCALE && `- Commit message language: ${LOCALE}`,
      ]
        .filter(Boolean)
        .join('\n'),
    ],
    ['user', 'Return only 1 type commit message describes the git diff summary: {summary}'],
  ]);
};

const summaryTemplate = [
  `You are to act as the author of a commit message in git. Your mission is to create clean and comprehensive commit messages in the conventional commit convention and explain WHAT were the changes and WHY the changes were done.`,
  `I'll enter a git diff summary, and your job is to convert it into a useful commit message.`,
  `--------`,
  `{text}`,
  `--------`,
  `Add a short description of the changes are done after the commit message. Don't start it with "This commit", just return only 1 type commit message describes the git diff summary.`,
]
  .filter(Boolean)
  .join('\n');

const summaryRefineTemplate = [
  summaryTemplate,
  `## Rules`,
  `- Choose only 1 type from the type-to-description below: <${TYPES_EXAMPLE}>`,
  `- Commit message must be a maximum of ${MAX_LENGTH} characters.`,
  LOCALE && `- Commit message language: ${LOCALE}`,
]
  .filter(Boolean)
  .join('\n');

export const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);
export const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(summaryRefineTemplate);
