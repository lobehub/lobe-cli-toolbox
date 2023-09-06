import { kebabCase, upperFirst } from 'lodash-es';
import pangu from 'pangu';

import gitmojis from '@/constants/gitmojis';

export type IssuesType = '' | 'fix' | 'close' | 'resove';
export interface CommitMessageObj {
  body?: string;
  emoji?: string;
  issues?: string;
  issuesType?: IssuesType;
  scope?: string;
  subject: string;
  type: string;
}

export const commitMessageToObj = (msg: string): CommitMessageObj => {
  const emojiReg = /^(\S+)\s/;
  const typeReg = /\s(\w+)(?=\(|:)/;
  const scopeReg = /\(([^)]+)\)/;
  const subjectReg = /:\s([^\n:]+)/s;

  return {
    body: msg.indexOf('\n') > 0 ? msg.slice(Math.max(0, msg.indexOf('\n') + 1)).trim() : undefined,
    emoji: emojiReg.test(msg) ? msg.match(emojiReg)?.[1] || '🔧' : '🔧',
    scope: scopeReg.test(msg) ? msg.match(scopeReg)?.[1] : undefined,
    subject: subjectReg.test(msg) ? msg.match(subjectReg)?.[1] || 'Nothing' : 'Nothing',
    type: typeReg.test(msg) ? msg.match(typeReg)?.[1] || 'chore' : 'chore',
  };
};

export const commotObjToMessage = ({
  emoji,
  type,
  scope,
  subject,
  issues,
  body,
  issuesType,
}: CommitMessageObj): string => {
  if (!type) return 'waiting for selection...';

  const formateType = type.toLowerCase();
  const formateScope = scope && kebabCase(scope).replaceAll(/\s+/g, ' ');
  const formateSubject = upperFirst(pangu.spacing(subject).replaceAll(/\s+/g, ' '));
  const formateIssues =
    issues &&
    issues
      .replace('#', '')
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[ ./|，]/g, ',')
      .split(',')
      .filter(Boolean)
      .map((num) => `${issuesType ? `${issuesType} ` : ''}#${num}`);

  return `${emoji} ${formateType}${formateScope ? `(${formateScope})` : ''}: ${formateSubject}${
    formateIssues && formateIssues?.length > 0 ? ` (${formateIssues.join(',')})` : ''
  }${body ? `\n\n${body}` : ''}`;
};

export const addEmojiToMessage = (message: string) => {
  const [type, ...rest]: any = message.split(': ');
  let emoji: string = '🔧';
  for (const item of gitmojis) {
    if (type.includes(item.type)) emoji = item.emoji;
  }
  return `${emoji} ${type}: ${rest.join(': ')}`;
};
