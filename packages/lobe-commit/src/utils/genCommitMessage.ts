import { kebabCase, upperFirst } from 'lodash-es';
import pangu from 'pangu';

import gitmojis from '@/constants/gitmojis';

export type IssuesType = '' | 'fix' | 'close' | 'resolve';
export interface CommitMessageObj {
  body?: string;
  emoji?: string;
  issues?: string;
  issuesType?: IssuesType;
  scope?: string;
  subject: string;
  type: string;
}

const HEADER = /^(?:(\S+)\s+)?(\w+)(?:\(([^)]*)\))?!?:\s?(.*)$/;

export const commitMessageToObj = (msg: string): CommitMessageObj => {
  const [header = '', ...rest] = msg.trim().split('\n');
  const body = rest.join('\n').trim() || undefined;
  const match = HEADER.exec(header.trim());

  if (!match) return { body, emoji: '🔧', subject: header.trim(), type: 'chore' };

  const [, emoji, type = 'chore', scope, subject = ''] = match;
  return {
    body,
    emoji: emoji || gitmojis.find((item) => item.type === type.toLowerCase())?.emoji || '🔧',
    scope: scope || undefined,
    subject: subject.trim(),
    type,
  };
};

export const commitObjToMessage = ({
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
  const formateSubject = upperFirst(pangu.spaceText(subject).replaceAll(/\s+/g, ' '));
  const formateIssues =
    issues &&
    issues
      .replaceAll('#', '')
      .replaceAll(/\s+/g, ' ')
      .replaceAll(/[ ./|，]/g, ',')
      .split(',')
      .filter(Boolean)
      .map((num) => `${issuesType ? `${issuesType} ` : ''}#${num}`);

  return `${emoji} ${formateType}${formateScope ? `(${formateScope})` : ''}: ${formateSubject}${
    formateIssues && formateIssues?.length > 0 ? ` (${formateIssues.join(',')})` : ''
  }${body ? `\n\n${body}` : ''}`;
};

const TYPE_PREFIX = /^(\w+)(?:\([^)]*\))?!?:/;

/** Prefixes a conventional commit message with the gitmoji of its type, unless it has one. */
export const addEmojiToMessage = (message: string) => {
  const trimmed = message.trimStart();
  if (gitmojis.some(({ code, emoji }) => trimmed.startsWith(emoji) || trimmed.startsWith(code)))
    return trimmed;

  const type = TYPE_PREFIX.exec(trimmed)?.[1]?.toLowerCase();
  const emoji = gitmojis.find((item) => item.type === type)?.emoji ?? '🔧';
  return `${emoji} ${trimmed}`;
};
