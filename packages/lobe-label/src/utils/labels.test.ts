import { describe, expect, it } from 'vitest';

import { planLabelSync } from './labels';
import { parseRepo } from './repo';

const label = (name: string, color = 'ffffff', description = '') => ({ color, description, name });

describe('planLabelSync', () => {
  it('creates missing labels and deletes labels only in the target', () => {
    const plan = planLabelSync([label('bug'), label('feat')], [label('bug'), label('old')]);

    expect(plan.create).toEqual([label('feat')]);
    expect(plan.remove).toEqual([label('old')]);
    expect(plan.update).toEqual([]);
  });

  it('updates same-name labels in place, ignoring case', () => {
    const plan = planLabelSync([label('Bug', 'ff0000', 'Broken')], [label('bug', 'FFFFFF')]);

    expect(plan.create).toEqual([]);
    expect(plan.remove).toEqual([]);
    expect(plan.update).toEqual([
      { from: label('bug', 'FFFFFF'), to: label('Bug', 'ff0000', 'Broken') },
    ]);
  });

  it('skips labels that are already identical', () => {
    const plan = planLabelSync(
      [label('bug', 'ff0000', 'Broken')],
      [{ color: 'FF0000', description: 'Broken', name: 'bug' }],
    );

    expect(plan).toEqual({ create: [], remove: [], update: [] });
  });

  it('treats a missing description like an empty one', () => {
    const plan = planLabelSync(
      [{ color: 'ffffff', description: null, name: 'bug' }],
      [label('bug')],
    );

    expect(plan.update).toEqual([]);
  });
});

describe('parseRepo', () => {
  it('parses owner/repo', () => {
    expect(parseRepo(' lobehub/lobe-chat ')).toEqual({ owner: 'lobehub', repo: 'lobe-chat' });
    expect(parseRepo('lobehub/lobe.cli_toolbox')).toEqual({
      owner: 'lobehub',
      repo: 'lobe.cli_toolbox',
    });
  });

  it.each(['lobehub', 'lobehub/', '/repo', 'a/b/c', 'https://github.com/a/b'])(
    'rejects %j',
    (slug) => {
      expect(parseRepo(slug)).toBeUndefined();
    },
  );
});
