export const HOOK = {
  CONTENTS: `#!/usr/bin/env sh
# lobe-commit as a commit hook
# Only plain "git commit" opens the wizard, -m / -F / merge / squash / amend keep their message
[ -n "$2" ] && exit 0
if npx -v >/dev/null 2>&1
then
  exec < /dev/tty
  npx -c "lobe-commit --hook $1"
else
  exec < /dev/tty
  lobe-commit --hook $1
fi`,
  FILENAME: 'prepare-commit-msg',
  PERMISSIONS: 0o775,
};
