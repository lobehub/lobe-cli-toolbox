// @ts-ignore
import GitHub from 'github-api';
import 'isomorphic-fetch';
import configStore from '../constants/config.js';
import getRepo from './getRepo.js';

export default async () => {
  const repoInfo = await getRepo();
  if (!repoInfo) return;
  const githubTokenConfig = configStore.get('githubToken');
  const gh = new GitHub(githubTokenConfig ? { token: githubTokenConfig } : {});
  const issues = await gh.getIssues(repoInfo.owner, repoInfo.repoName);
  const res = await issues.listIssues({ state: 'open' });
  return res.data;
};
