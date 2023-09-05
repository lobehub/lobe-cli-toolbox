import { consola } from 'consola';

export const formatRepoProps = (
  target: string,
  source: string,
): {
  getOwner: string;
  getRepo: string;
  targetOwner: string;
  targetRepo: string;
} => {
  const targetRepoArray = target.split('/') as [string, string];
  const sourceRepoArray = source.split('/') as [string, string];

  if (targetRepoArray.length !== 2) {
    consola.error('Wrong target repo, should be owner/repo');
    process.exit(1);
  }

  if (sourceRepoArray.length !== 2) {
    consola.error('Wrong source repo, should be owner/repo');
    process.exit(1);
  }

  const [getOwner, getRepo] = sourceRepoArray;
  const [targetOwner, targetRepo] = targetRepoArray;

  return {
    getOwner,
    getRepo,
    targetOwner,
    targetRepo,
  };
};
