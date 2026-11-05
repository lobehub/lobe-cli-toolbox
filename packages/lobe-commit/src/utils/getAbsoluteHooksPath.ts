import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import { alert } from '@lobehub/cli-ui';

export const ERROR_CODE = 'not git';

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

/**
 * Husky 9 sets `core.hooksPath` to `.husky/_`. Files there are shims that run the
 * same-named script in `.husky/`, so the lobe-commit hook belongs next to the other
 * user hooks. Anything else (plain `.git/hooks`, Husky 8's `.husky`) is used as-is.
 */
export const toUserHookPath = (
  hookPath: string,
  exists: (file: string) => boolean = existsSync,
) => {
  const dir = path.dirname(hookPath);
  if (path.basename(dir) !== '_') return hookPath;
  if (path.basename(path.dirname(dir)) !== '.husky') return hookPath;
  if (!exists(path.join(dir, 'h'))) return hookPath;
  return path.join(path.dirname(dir), path.basename(hookPath));
};

/**
 * Returns `undefined` outside a git repository.
 */
export const resolveHooksPath = (hookName: string): string | undefined => {
  try {
    const gitDir = git('rev-parse', '--absolute-git-dir');
    try {
      // `core.hooksPath` may be relative to the working tree root.
      return toUserHookPath(
        path.resolve(
          git('rev-parse', '--show-toplevel'),
          git('config', '--get', 'core.hooksPath'),
          hookName,
        ),
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
