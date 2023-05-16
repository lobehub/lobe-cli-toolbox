import { execaSync } from 'execa';
import path from 'path';

const getAbsoluteHooksPath = (hookName: string): string => {
  try {
    const { stdout: coreHooksPath }: any = execaSync('git', ['config', '--get', 'core.hooksPath']);

    return path.resolve(coreHooksPath, hookName);
  } catch (err) {
    const { stdout: gitDirPath } = execaSync('git', ['rev-parse', '--absolute-git-dir']);

    return path.resolve(gitDirPath + '/hooks', hookName);
  }
};

export default getAbsoluteHooksPath;
