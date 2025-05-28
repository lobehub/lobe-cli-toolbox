import { alert } from '@lobehub/cli-ui';
import { describe, expect, it, vi } from 'vitest';

import { checkOptionKeys } from './checkOptionKeys';

// Mock the alert module
vi.mock('@lobehub/cli-ui', () => ({
  alert: {
    error: vi.fn(),
  },
}));

describe('checkOptionKeys', () => {
  it('should not call alert.error when option key exists', () => {
    const opt = {
      outputLocales: ['en', 'zh-CN'],
    };

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).not.toHaveBeenCalled();
  });

  it('should call alert.error when option key is missing', () => {
    const opt = {};

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).toHaveBeenCalledWith(expect.stringContaining("Can't find"));
    expect(alert.error).toHaveBeenCalledWith(expect.stringContaining('outputLocales'));
  });

  it('should call alert.error when option key is null', () => {
    const opt = {
      outputLocales: null,
    };

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).toHaveBeenCalled();
  });

  it('should call alert.error when option key is undefined', () => {
    const opt = {
      outputLocales: undefined,
    };

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).toHaveBeenCalled();
  });

  it('should call alert.error when option key is empty string', () => {
    const opt = {
      outputLocales: '',
    };

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).toHaveBeenCalled();
  });

  it('should call alert.error when option key is empty array', () => {
    const opt = {
      outputLocales: [],
    };

    checkOptionKeys(opt, 'outputLocales');

    expect(alert.error).toHaveBeenCalled();
  });
});
