import chalk from 'chalk';
import { ChatGPTAPI } from 'chatgpt';
import { execSync } from 'child_process';
import storeConfig from '../constants/config';
import gitmojis from '../constants/gitmojis.js';

const genPrompt = (diff: string): string =>
  `I want you to act as the author of a commit message in git.` +
  `I'll enter a git diff, and your job is to convert it into a useful commit message.` +
  `Do not preface the commit with anything, use the present tense, use the conventional commits specification <type>(<optional scope>): <subject>,` +
  `return 1 message: ${diff}`;

const addEmoji = (message: string) => {
  const [type, ...rest]: any = message.split(': ');
  let emoji: string = '🔧';
  gitmojis.forEach((item) => {
    if (type.includes(item.type)) emoji = item.emoji;
  });
  return `${emoji} ${type}: ${rest.join(': ')}`;
};

export default async () => {
  const apiKey: any = storeConfig.get('openaiToken');
  if (!apiKey) {
    console.log(chalk.red('🤯 Please set the OpenAI Token by lobe-commit --config'));
    process.exit(1);
    return;
  }

  let diff = execSync('git diff --staged').toString();

  if (diff.length > 5000) {
    diff = diff.substring(0, 5000);
  }

  // Handle empty diff
  if (!diff) {
    console.log(chalk.yellow('🤯 No changes to commit'));
    process.exit(1);
  }
  const api = new ChatGPTAPI({
    apiKey,
  });

  const { text } = await api.sendMessage(genPrompt(diff));

  return addEmoji(text);
};
