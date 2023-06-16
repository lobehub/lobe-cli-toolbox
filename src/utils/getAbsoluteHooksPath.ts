import { execaSync } from 'execa';
import path from 'node:path';

const getAbsoluteHooksPath = (hookName: string): string => {
  try {
    const { stdout: coreHooksPath }: any = execaSync('git', ['config', '--get', 'core.hooksPath']);

    return path.resolve(coreHooksPath, hookName);
  } catch {
    const { stdout: gitDirectoryPath } = execaSync('git', ['rev-parse', '--absolute-git-dir']);

    return path.resolve(gitDirectoryPath + '/hooks', hookName);
  }
};

export default getAbsoluteHooksPath;
