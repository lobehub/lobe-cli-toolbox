import { Octokit } from '@octokit/rest';
import { consola } from 'consola';

import { getGithubToken } from '@/store/confStore';

import type { Label } from './labels';
import type { Repo } from './repo';

let client: Octokit | undefined;

const octokit = (): Octokit => {
  if (client) return client;
  const token = getGithubToken();
  if (!token) {
    consola.error('Need a GitHub token: run `lobe-label -o` or set GITHUB_TOKEN');
    process.exit(1);
  }
  client = new Octokit({ auth: token });
  return client;
};

export const listLabels = async ({ owner, repo }: Repo): Promise<Label[]> => {
  const labels = await octokit().paginate(octokit().rest.issues.listLabelsForRepo, {
    owner,
    per_page: 100,
    repo,
  });
  return labels.map(({ color, description, name }) => ({ color, description, name }));
};

export const createLabel = async ({ owner, repo }: Repo, { color, description, name }: Label) => {
  await octokit().rest.issues.createLabel({
    color,
    description: description ?? undefined,
    name,
    owner,
    repo,
  });
};

export const updateLabel = async ({ owner, repo }: Repo, from: Label, to: Label) => {
  await octokit().rest.issues.updateLabel({
    color: to.color,
    description: to.description ?? '',
    name: from.name,
    new_name: to.name,
    owner,
    repo,
  });
};

export const deleteLabel = async ({ owner, repo }: Repo, { name }: Label) => {
  await octokit().rest.issues.deleteLabel({ name, owner, repo });
};
