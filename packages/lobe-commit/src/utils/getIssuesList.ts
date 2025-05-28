import { Octokit } from 'octokit';

import { selectors } from '@/store';

import getRepo from './getRepo';

export interface IssuesResult {
  data?: any[];
  error?:
    | 'NO_TOKEN'
    | 'NO_REPO'
    | 'INVALID_TOKEN'
    | 'PERMISSION_DENIED'
    | 'TIMEOUT'
    | 'NETWORK_ERROR'
    | 'UNKNOWN_ERROR';
  success: boolean;
}

// 创建一个带超时的 Promise
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs);
    }),
  ]);
};

export default async (): Promise<IssuesResult> => {
  try {
    const repoInfo = await getRepo();
    if (!repoInfo) {
      return { error: 'NO_REPO', success: false };
    }

    const githubToken = selectors.getGithubToken();
    if (!githubToken) {
      return { error: 'NO_TOKEN', success: false };
    }

    const octokit = new Octokit({
      auth: githubToken,
    });

    // 设置 5 秒超时
    const { data } = await withTimeout(
      octokit.rest.issues.listForRepo({
        owner: repoInfo.owner,
        repo: repoInfo.repoName,
        state: 'open',
      }),
      5000,
    );

    return { data, success: true };
  } catch (error: any) {
    // 处理不同类型的错误
    if (error.message === 'TIMEOUT') {
      return { error: 'TIMEOUT', success: false };
    }

    if (error.status === 401) {
      return { error: 'INVALID_TOKEN', success: false };
    }

    if (error.status === 403) {
      return { error: 'PERMISSION_DENIED', success: false };
    }

    if (error.status === 404) {
      // 404 可能是仓库不存在或者没有权限访问
      return { error: 'PERMISSION_DENIED', success: false };
    }

    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      return { error: 'NETWORK_ERROR', success: false };
    }

    return { error: 'UNKNOWN_ERROR', success: false };
  }
};
