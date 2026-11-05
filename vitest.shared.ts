import { defineProject } from 'vitest/config';

/** Per-package Vitest project; `@/` resolves through each package's tsconfig `paths`. */
export const defineLobeProject = (name: string) =>
  defineProject({
    resolve: { tsconfigPaths: true },
    test: { globals: true, name },
  });
