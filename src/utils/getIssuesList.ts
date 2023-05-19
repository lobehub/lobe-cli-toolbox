// @ts-ignore
import GitHub from 'github-api';
import configStore, { CONFIG_NAME } from '../constants/config';
import getRepo from './getRepo';

export default async () => {
  try {
    const repoInfo = await getRepo();
    if (!repoInfo) return;
    const githubTokenConfig = configStore.get(CONFIG_NAME.GITHUB_TOKEN);
    const gh = new GitHub(githubTokenConfig ? { token: githubTokenConfig } : {});
    const issues = await gh.getIssues(repoInfo.owner, repoInfo.repoName);
    const res = await issues.listIssues({ state: 'open' });
    return res.data;
  } catch {
    return undefined;
  }
};
