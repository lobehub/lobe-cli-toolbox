import { Alert, Spinner } from '@inkjs/ui';
import fs from 'node:fs';
import { memo, useEffect, useState } from 'react';

import getAbsoluteHooksPath from '@/utils/getAbsoluteHooksPath';

import { HOOK } from './HookCreate';

const HookRemove = memo(() => {
  const [loading, setLoading] = useState<boolean>(true);
  try {
    useEffect(() => {
      const hookFile = getAbsoluteHooksPath(HOOK.FILENAME);
      fs.unlinkSync(hookFile);
      setLoading(false);
    }, []);
    if (loading) return <Spinner label=" Loading..." />;
    return <Alert variant="success">{` Lobe-commit hook removed successfully!`}</Alert>;
  } catch {
    return <Alert variant="error">{` Error: Gitmoji commit hook is not created`}</Alert>;
  }
});

export default HookRemove;
