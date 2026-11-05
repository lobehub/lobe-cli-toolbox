import chalk from 'chalk';

import gitmojis from '@/constants/gitmojis';

export const formatGitmojiList = () => {
  const typeWidth = Math.max(...gitmojis.map((item) => item.type.length));
  const codeWidth = Math.max(...gitmojis.map((item) => item.code.length));
  return gitmojis
    .map(
      (item) =>
        `  ${item.emoji}  ${chalk.bold(item.type.padEnd(typeWidth))}  ${chalk.gray(
          item.code.padEnd(codeWidth),
        )}  ${item.desc}`,
    )
    .join('\n');
};

const List = () => {
  process.stdout.write(`${formatGitmojiList()}\n`);
};

export default List;
