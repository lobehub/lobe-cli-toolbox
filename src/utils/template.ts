import storeConfig, { CONFIG_NAME } from '../constants/config.js';
import gitmojis from '../constants/gitmojis.js';

const typesExample = gitmojis.map((item) => `- ${item.type}: ${item.descEN}`).join('\n');

const custionPrompt: string | any = storeConfig.get(CONFIG_NAME.PROMPT);
const locale: number | any = storeConfig.get(CONFIG_NAME.LOCALE);
const maxLength: number | any = storeConfig.get(CONFIG_NAME.MAX_LENGTH);

let prompt: string =
  `You are to act as the author of a commit message in git. Your mission is to create clean and comprehensive commit messages in the conventional commit convention and explain WHAT were the changes and WHY the changes were done.` +
  `I'll enter a git diff summary, and your job is to convert it into a useful commit message.` +
  `Add a short description of the changes are done after the commit message. Don't start it with "This commit", just describe the changes.` +
  `Use the present tense. Lines must not be longer than 74 characters.`;
if (custionPrompt) prompt = custionPrompt;

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
