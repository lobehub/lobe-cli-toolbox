import { execFileSync } from 'node:child_process';

export interface RepoInfo {
  owner: string;
  repoName: string;
}

const GITHUB_REMOTE =
  /^(?:https?:\/\/(?:[^@/]+@)?github\.com\/|(?:ssh:\/\/)?git@github\.com[:/])([^/]+)\/(.+?)(?:\.git)?\/?$/;

/** Parses HTTPS and SSH GitHub remote URLs, with or without the `.git` suffix. */
export const parseGitHubRemote = (url: string): RepoInfo | undefined => {
  const match = GITHUB_REMOTE.exec(url.trim());
  if (!match) return;
  return { owner: match[1]!, repoName: match[2]! };
};

const getRepo = async (): Promise<RepoInfo | undefined> => {
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return parseGitHubRemote(url);
  } catch {
    return;
  }
};

export default getRepo;
