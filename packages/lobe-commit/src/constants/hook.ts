export const HOOK = {
  CONTENTS: `#!/usr/bin/env sh
# lobe-commit as a commit hook
if npx -v >/dev/null 2>&1
then
  exec < /dev/tty
  npx -c "lobe-commit --hook $1 $2"
else
  exec < /dev/tty
  lobe-commit --hook $1 $2
fi`,
  FILENAME: 'prepare-commit-msg',
  PERMISSIONS: 0o775,
};
