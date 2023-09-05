import { consola } from 'consola';

import { formatRepoProps } from '@/utlis/formatRepoProps';
import { deleteLabel, queryLabels } from '@/utlis/octokit';

const Delete = async (target: string, source: string) => {
  const { targetOwner, targetRepo } = formatRepoProps(target, source);

  try {
    const labels = await queryLabels(targetOwner, targetRepo);

    if (labels?.length > 0) {
      for await (let { name } of labels) {
        await deleteLabel(targetOwner, targetRepo, name);
      }

      consola.info(`Delete ${labels.length} labels success`);
    }
  } catch (error) {
    consola.error(error);
  }
};

export default Delete;
