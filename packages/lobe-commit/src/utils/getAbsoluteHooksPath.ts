import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { alert } from '@lobehub/cli-ui';

export const ERROR_CODE = 'not git';

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/**
 * Returns `undefined` outside a git repository.
 */
export const resolveHooksPath = (hookName: string): string | undefined => {
  try {
    const gitDir = git('rev-parse', '--absolute-git-dir');
    try {
      // `core.hooksPath` may be relative to the working tree root.
      return path.resolve(
        git('rev-parse', '--show-toplevel'),
        git('config', '--get', 'core.hooksPath'),
        hookName,
      );
    } catch {
      return path.join(gitDir, 'hooks', hookName);
    }
  } catch {
    return undefined;
  }
};

const getAbsoluteHooksPath = (hookName: string): string => {
  const hookPath = resolveHooksPath(hookName);
  if (hookPath) return hookPath;

  alert.error('Please check if this is a git folder', true);
  return ERROR_CODE;
};

export default getAbsoluteHooksPath;
