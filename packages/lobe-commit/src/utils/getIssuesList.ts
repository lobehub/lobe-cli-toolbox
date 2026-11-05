import { Octokit, type RestEndpointMethodTypes } from '@octokit/rest';

import { selectors } from '@/store';

import getRepo from './getRepo';

export type Issue = RestEndpointMethodTypes['issues']['listForRepo']['response']['data'][number];

export interface IssuesResult {
  data?: Issue[];
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

const NETWORK_ERROR_CODES = new Set(['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT']);

export const toIssuesError = (error: any): IssuesResult['error'] => {
  if (error?.name === 'TimeoutError' || error?.cause?.name === 'TimeoutError') return 'TIMEOUT';
  if (error?.status === 401) return 'INVALID_TOKEN';
  // 404 means the repository is private or does not exist for this token.
  if (error?.status === 403 || error?.status === 404) return 'PERMISSION_DENIED';
  if (NETWORK_ERROR_CODES.has(error?.code) || NETWORK_ERROR_CODES.has(error?.cause?.code))
    return 'NETWORK_ERROR';
  return 'UNKNOWN_ERROR';
};

const getIssuesList = async (): Promise<IssuesResult> => {
  const repoInfo = await getRepo();
  if (!repoInfo) return { error: 'NO_REPO', success: false };

  const githubToken = selectors.getGithubToken();
  if (!githubToken) return { error: 'NO_TOKEN', success: false };

  try {
    const { data } = await new Octokit({ auth: githubToken }).rest.issues.listForRepo({
      owner: repoInfo.owner,
      repo: repoInfo.repoName,
      request: { signal: AbortSignal.timeout(5000) },
      state: 'open',
    });

    // The issues endpoint also returns pull requests.
    return { data: data.filter((issue) => !issue.pull_request), success: true };
  } catch (error) {
    return { error: toIssuesError(error), success: false };
  }
};

export default getIssuesList;
