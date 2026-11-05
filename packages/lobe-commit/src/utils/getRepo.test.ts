import { describe, expect, it } from 'vitest';

import { parseGitHubRemote } from './getRepo';

describe('parseGitHubRemote', () => {
  it.each([
    'https://github.com/lobehub/lobe-cli-toolbox.git',
    'https://github.com/lobehub/lobe-cli-toolbox',
    'https://token@github.com/lobehub/lobe-cli-toolbox.git',
    'git@github.com:lobehub/lobe-cli-toolbox.git',
    'git@github.com:lobehub/lobe-cli-toolbox',
    'ssh://git@github.com/lobehub/lobe-cli-toolbox.git',
    'https://github.com/lobehub/lobe-cli-toolbox.git\n',
  ])('parses %j', (url) => {
    expect(parseGitHubRemote(url)).toEqual({ owner: 'lobehub', repoName: 'lobe-cli-toolbox' });
  });

  it.each(['https://gitlab.com/lobehub/lobe-cli-toolbox.git', 'not a url', ''])(
    'ignores %j',
    (url) => {
      expect(parseGitHubRemote(url)).toBeUndefined();
    },
  );
});
