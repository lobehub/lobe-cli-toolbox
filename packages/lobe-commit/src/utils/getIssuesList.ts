import { Octokit } from 'octokit';

import { selectors } from '@/store';

import getRepo from './getRepo';

export default async () => {
  try {
    const repoInfo = await getRepo();
    if (!repoInfo) return;
    const octokit = new Octokit({
      auth: selectors.getGithubToken(),
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
