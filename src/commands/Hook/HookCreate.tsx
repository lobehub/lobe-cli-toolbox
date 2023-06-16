import { Alert, Spinner } from '@inkjs/ui';
import fs from 'node:fs';
import { memo, useEffect, useState } from 'react';

import getAbsoluteHooksPath from '../../utils/getAbsoluteHooksPath';

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

const HookCreate = memo(() => {
  const [loading, setLoading] = useState<boolean>(true);
  try {
    useEffect(() => {
      const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);
      fs.writeFileSync(hookFile, HOOK.CONTENTS, { mode: HOOK.PERMISSIONS });
      setLoading(false);
    }, []);
    if (loading) return <Spinner label=" Loading..." />;
    return <Alert variant="success">{` Lobe-commit hook created successfully!`}</Alert>;
  } catch (error: any) {
    return <Alert variant="error">{` ${error.message}`}</Alert>;
  }
});

export default HookCreate;
