import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

/** `git diff --cached --quiet` exits with 1 when something is staged. */
export const hasStagedChanges = () => {
  try {
    execFileSync('git', ['diff', '--cached', '--quiet'], { stdio: 'ignore' });
    return false;
  } catch (error) {
    return (error as { status?: number }).status === 1;
  }
};

/**
 * Commits with `message`, or as a `prepare-commit-msg` hook writes it to the file git passed in.
 * Returns whether it succeeded; git prints its own errors.
 */
export const commitWithMessage = (message: string, hookFile?: string) => {
  try {
    if (hookFile) writeFileSync(hookFile, message);
    else execFileSync('git', ['commit', '-m', message], { stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
};
