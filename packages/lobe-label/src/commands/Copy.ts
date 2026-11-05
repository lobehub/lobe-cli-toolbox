import { consola } from 'consola';

import { planLabelSync } from '@/utils/labels';
import { createLabel, deleteLabel, listLabels, updateLabel } from '@/utils/octokit';
import { parseRepo } from '@/utils/repo';

const run = async (description: string, task: () => Promise<unknown>) => {
  try {
    await task();
    consola.success(description);
    return true;
  } catch (error) {
    consola.error(`${description} failed:`, (error as Error).message);
    return false;
  }
};

/**
 * Makes the labels of `target` match `source`: same-name labels are updated in place (issues keep
 * them), missing ones are created and labels that only exist in the target are deleted.
 *
 * Resolves to `false` when any step failed.
 */
const Copy = async (target: string, source: string): Promise<boolean> => {
  const targetRepo = parseRepo(target);
  const sourceRepo = parseRepo(source);
  if (!targetRepo || !sourceRepo) {
    consola.error(`Wrong ${targetRepo ? 'source' : 'target'} repo, should be owner/repo`);
    return false;
  }

  const sourceLabels = await listLabels(sourceRepo);
  if (sourceLabels.length === 0) {
    consola.warn(`${source} has no labels, nothing to copy`);
    return true;
  }

  const plan = planLabelSync(sourceLabels, await listLabels(targetRepo));
  const results: boolean[] = [];

  for (const { from, to } of plan.update)
    results.push(await run(`[${to.name}] updated`, () => updateLabel(targetRepo, from, to)));
  for (const label of plan.create)
    results.push(await run(`[${label.name}] created`, () => createLabel(targetRepo, label)));
  for (const label of plan.remove)
    results.push(await run(`[${label.name}] deleted`, () => deleteLabel(targetRepo, label)));

  consola.info(
    `Copied ${sourceLabels.length} labels from ${source} to ${target}: ` +
      `${plan.create.length} created, ${plan.update.length} updated, ${plan.remove.length} deleted`,
  );
  return results.every(Boolean);
};

export default Copy;
