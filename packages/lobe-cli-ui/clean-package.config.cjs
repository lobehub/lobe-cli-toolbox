module.exports = {
  indent: 2,
  remove: ['scripts', 'lint-staged', 'devDependencies', 'publishConfig', 'clean-package'],
  replace: {
    // Workspace keeps exports → src for monorepo typecheck + CLI bundling.
    // Pack/publish swaps to built lib/ artifacts.
    exports: {
      '.': {
        types: './lib/index.d.ts',
        import: './lib/index.js',
        default: './lib/index.js',
      },
    },
    main: './lib/index.js',
    module: './lib/index.js',
    types: './lib/index.d.ts',
  },
};
