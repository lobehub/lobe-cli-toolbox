import { describe, expect, it } from 'vitest';

import { addEmojiToMessage, commitMessageToObj, commitObjToMessage } from './genCommitMessage';

describe('addEmojiToMessage', () => {
  it.each([
    ['feat: add login', '✨ feat: add login'],
    ['fix(api): handle 404', '🐛 fix(api): handle 404'],
    ['refactor!: drop node 18', '♻️ refactor!: drop node 18'],
  ])('prefixes %j with the gitmoji of its type', (message, expected) => {
    expect(addEmojiToMessage(message)).toBe(expected);
  });

  it('matches the type exactly, not a substring of the scope', () => {
    expect(addEmojiToMessage('chore(fix-ci): bump action')).toBe('🔧 chore(fix-ci): bump action');
  });

  it('keeps an emoji the model already added', () => {
    expect(addEmojiToMessage('✨ feat: add login')).toBe('✨ feat: add login');
    expect(addEmojiToMessage(':bug: fix: crash')).toBe(':bug: fix: crash');
  });

  it('falls back to 🔧 and keeps messages without a type intact', () => {
    expect(addEmojiToMessage('update readme')).toBe('🔧 update readme');
  });
});

describe('commitObjToMessage', () => {
  it('waits until a type is selected', () => {
    expect(commitObjToMessage({ subject: 'x', type: '' })).toBe('waiting for selection...');
  });

  it('formats scope, subject, issues and body', () => {
    expect(
      commitObjToMessage({
        body: 'details',
        emoji: '🐛',
        issues: '#12 #34',
        issuesType: 'fix',
        scope: 'Api Client',
        subject: 'handle 404 in 新的client',
        type: 'Fix',
      }),
    ).toBe('🐛 fix(api-client): Handle 404 in 新的 client (fix #12,fix #34)\n\ndetails');
  });
});

describe('commitMessageToObj', () => {
  it('parses a gitmoji conventional commit', () => {
    expect(commitMessageToObj('✨ feat(cli): add flag\n\nlong body')).toEqual({
      body: 'long body',
      emoji: '✨',
      scope: 'cli',
      subject: 'add flag',
      type: 'feat',
    });
  });
});
