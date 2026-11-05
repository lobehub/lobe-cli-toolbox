export interface Repo {
  owner: string;
  repo: string;
}

/** Parses `owner/repo`, returning `undefined` for anything else. */
export const parseRepo = (slug: string): Repo | undefined => {
  const match = /^([\w.-]+)\/([\w.-]+)$/.exec(slug.trim());
  if (!match) return;
  return { owner: match[1]!, repo: match[2]! };
};
