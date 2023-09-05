import { Octokit } from '@octokit/rest';
import { consola } from 'consola';

import { getConfig } from '@/store/confStore';

const octokitClient = (): Octokit => {
  const token = getConfig('githubToken');
  if (!token) {
    consola.error('Need token!');
    process.exit(1);
  }
  const octokit = new Octokit({ auth: `token ${token}` });
  return octokit;
};

export const queryLabels = async (owner: string, repo: string, page: number = 1) => {
  const octokit = octokitClient();
  let { data: labels } = await octokit.issues.listLabelsForRepo({
    owner,
    page,
    per_page: 100,
    repo,
  });
  if (labels.length >= 100) {
    labels = labels.concat(await queryLabels(owner, repo, page + 1));
  }
  return labels;
};

export const createLabel = async (
  owner: string,
  repo: string,
  name: string,
  color: string,
  description?: string,
) => {
  const octokit = octokitClient();
  try {
    await octokit.issues.createLabel({
      color,
      description,
      name,
      owner,
      repo,
    });
    consola.success(`[${name}] created!`);
  } catch (error) {
    consola.error(`[${name}] error:`, error);
  }
};

export const deleteLabel = async (owner: string, repo: string, name: string) => {
  const octokit = octokitClient();
  await octokit.issues.deleteLabel({
    name,
    owner,
    repo,
  });
  consola.success(`[${name}] deleted!`);
};
