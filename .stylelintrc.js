module.exports = {
  extends: ['stylelint-config-recommended', 'stylelint-config-clean-order'],
  overrides: [
    {
      files: ['*.less', '*.css'],
      plugins: ['stylelint-order'],
      customSyntax: 'postcss-less',
    },
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      plugins: ['stylelint-order'],
      customSyntax: 'postcss-styled-syntax',
    },
  ],
}
