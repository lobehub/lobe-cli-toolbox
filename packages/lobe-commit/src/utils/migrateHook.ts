import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import { HOOK } from '@/constants/hook';
import { resolveHooksPath } from '@/utils/getAbsoluteHooksPath';

/**
 * Written by older `lobe-commit --init`, it opened the wizard even for `git commit -m`.
 */
export const LEGACY_HOOK_CONTENTS = `#!/usr/bin/env sh
# lobe-commit as a commit hook
if npx -v >/dev/null 2>&1
then
  exec < /dev/tty
  npx -c "lobe-commit --hook $1"
else
  exec < /dev/tty
  lobe-commit --hook $1
fi`;

/**
 * Updates an unmodified hook from an older `lobe-commit --init`, returns whether it was rewritten.
 */
export const migrateHook = () => {
  try {
    const hookFile = resolveHooksPath(HOOK.FILENAME);
    if (!hookFile || !existsSync(hookFile)) return false;
    if (readFileSync(hookFile, 'utf8').trim() !== LEGACY_HOOK_CONTENTS) return false;

    writeFileSync(hookFile, HOOK.CONTENTS, { mode: HOOK.PERMISSIONS });
    return true;
  } catch {
    return false;
  }
};
