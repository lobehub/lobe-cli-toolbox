import gitmojis from '@/constants/gitmojis';
import { getConfig } from '@/store/confStore';

const typesExample = gitmojis.map((item) => `- ${item.type}: ${item.desc}`).join('\n');

const custionPrompt = getConfig('prompt');
const locale = getConfig('locale');
const maxLength = getConfig('maxLength');

export const BASE_PROMPT =
  `You are to act as the author of a commit message in git. Your mission is to create clean and comprehensive commit messages in the conventional commit convention and explain WHAT were the changes and WHY the changes were done.` +
  `I'll enter a git diff summary, and your job is to convert it into a useful commit message.` +
  `Add a short description of the changes are done after the commit message. Don't start it with "This commit", just describe the changes.` +
  `Use the present tense. Lines must not be longer than 74 characters.`;

let prompt: string = custionPrompt ? custionPrompt : BASE_PROMPT;

const template: string = [
  prompt,
  `Choose only 1 type from the type-to-description below:`,
  typesExample,
  `Commit message must be a maximum of ${maxLength} characters.`,
  locale && `Commit message language: ${locale}`,
]
  .filter(Boolean)
  .join('\n');

export default template;
