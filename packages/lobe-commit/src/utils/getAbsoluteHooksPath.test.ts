import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { toUserHookPath } from './getAbsoluteHooksPath';

const hook = (...parts: string[]) => path.join(...parts);

describe('toUserHookPath', () => {
  const root = hook('/repo', '.husky');

  it('installs beside Husky 9 user hooks instead of overwriting the shim', () => {
    const shim = hook(root, '_', 'prepare-commit-msg');
    expect(toUserHookPath(shim, (file) => file === hook(root, '_', 'h'))).toBe(
      hook(root, 'prepare-commit-msg'),
    );
  });

  it.each([
    hook('/repo', '.git', 'hooks', 'prepare-commit-msg'),
    hook('/repo', '.husky', 'prepare-commit-msg'),
    hook('/repo', 'custom', '_', 'prepare-commit-msg'),
    hook(root, '_', 'prepare-commit-msg'),
  ])('leaves %s in place', (file) => {
    expect(toUserHookPath(file, () => false)).toBe(file);
  });
});
