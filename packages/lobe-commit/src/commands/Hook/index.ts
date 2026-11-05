import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, relative } from 'node:path';

import { alert } from '@lobehub/cli-ui';
import chalk from 'chalk';

import { HOOK } from '@/constants/hook';
import getAbsoluteHooksPath from '@/utils/getAbsoluteHooksPath';

export const isLobeCommitHook = (file: string) => {
  try {
    return readFileSync(file, 'utf8').includes('lobe-commit');
  } catch {
    return false;
  }
};

const display = (file: string) => chalk.cyan(relative(process.cwd(), file) || file);

export const createHook = () => {
  const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);

  if (existsSync(hookFile) && !isLobeCommitHook(hookFile)) {
    alert.error(
      `${display(hookFile)} already exists and was not created by lobe-commit. ` +
        `Remove it first, or call ${chalk.bold('lobe-commit --hook "$1"')} from it yourself.`,
      true,
    );
  }

  mkdirSync(dirname(hookFile), { recursive: true });
  writeFileSync(hookFile, HOOK.CONTENTS, { mode: HOOK.PERMISSIONS });
  alert.success(
    `Installed the git hook at ${display(hookFile)}, ${chalk.bold('git commit')} now opens lobe-commit`,
  );
};

export const removeHook = () => {
  const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);

  if (!existsSync(hookFile)) return alert.info('No lobe-commit git hook is installed');
  if (!isLobeCommitHook(hookFile)) {
    alert.error(`${display(hookFile)} was not created by lobe-commit, leaving it untouched`, true);
  }

  unlinkSync(hookFile);
  alert.success(`Removed the git hook at ${display(hookFile)}`);
};
