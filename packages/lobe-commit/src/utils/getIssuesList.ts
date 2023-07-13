import { Octokit } from 'octokit';

import { getConfig } from '@/store/confStore';

import getRepo from './getRepo';

const githubTokenConfig = getConfig('githubToken');

export default async () => {
  try {
    const repoInfo = await getRepo();
    if (!repoInfo) return;
    const octokit = new Octokit({
      auth: githubTokenConfig ? githubTokenConfig : undefined,
    });
    const { data } = await octokit.rest.issues.listForRepo({
      owner: repoInfo.owner,
      repo: repoInfo.repoName,
      state: 'open',
    });
    return data;
  } catch {
    return;
  }
};
