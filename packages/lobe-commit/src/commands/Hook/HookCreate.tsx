import { Alert, Spinner } from '@inkjs/ui';
import fs from 'node:fs';
import { memo, useEffect, useState } from 'react';

import { HOOK } from '@/constants/hook';
import getAbsoluteHooksPath from '@/utils/getAbsoluteHooksPath';

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
