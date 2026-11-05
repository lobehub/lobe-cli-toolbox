import { defineConfig } from '@lobehub/lint';

export default defineConfig(
  {
    ignores: ['**/dist', '**/coverage', 'packages/*/examples/**'],
    react: true,
    typescript: true,
  },
  {
    rules: {
      // CLIs exit with a status code on fatal errors.
      'unicorn/no-process-exit': 'off',
      // Commands and components default-export one module per file.
      'no-restricted-syntax': 'off',
    },
  },
);
