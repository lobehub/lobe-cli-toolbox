import { alert } from '@lobehub/cli-ui';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { checkOptionKeys } from './checkOptionKeys';

vi.mock('@lobehub/cli-ui', () => ({
  alert: {
    error: vi.fn(),
  },
}));

beforeEach(() => {
  vi.mocked(alert.error).mockClear();
});

describe('checkOptionKeys', () => {
  it('accepts a present option', () => {
    checkOptionKeys({ outputLocales: ['en', 'zh-CN'] }, 'outputLocales');

    expect(alert.error).not.toHaveBeenCalled();
  });

  it.each([
    ['missing', {}],
    ['null', { entry: null }],
    ['undefined', { entry: undefined }],
    ['an empty string', { entry: '' }],
    ['an empty array', { entry: [] }],
  ])('exits with the option name when it is %s', (_, opt) => {
    checkOptionKeys(opt, 'entry');

    expect(alert.error).toHaveBeenCalledTimes(1);
    expect(alert.error).toHaveBeenCalledWith(expect.stringMatching(/Can't find .*entry/), true);
  });
});
