export const HOOK = {
  CONTENTS:
    '#!/usr/bin/env sh\n# lobe-commit as a commit hook\n' +
    'if npx -v >&/dev/null\n' +
    'then\n' +
    '  exec < /dev/tty\n  npx -c "lobe-commit --hook $1 $2"\n' +
    'else\n' +
    '  exec < /dev/tty\n  lobe-commit --hook $1 $2\n' +
    'fi',
  FILENAME: 'prepare-commit-msg',
  PERMISSIONS: 0o775,
};
