import { consola } from 'consola';

import { formatRepoProps } from '@/utlis/formatRepoProps';
import { createLabel, queryLabels } from '@/utlis/octokit';

import Delete from './Delete';

const Copy = async (target: string, source: string) => {
  await Delete(target, source);

  const { getOwner, getRepo, targetOwner, targetRepo } = formatRepoProps(target, source);

  try {
    const getLabels = await queryLabels(getOwner, getRepo);

    if (getLabels?.length > 0) {
      for (const lable of getLabels) {
        await createLabel(
          targetOwner,
          targetRepo,
          lable.name,
          lable.color,
          lable.description || null,
        );
      }
    } else {
      consola.warn(`${getOwner}/${getRepo} labels is empty`);
    }
    consola.success(`Copy ${getLabels.length} labels success`);
  } catch (error) {
    consola.error(error);
  }
};

export default Copy;
