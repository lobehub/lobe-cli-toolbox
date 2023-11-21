module.exports = {
  markdown: {
    entry: ['./README.zh-CN.md', './docs'],
    entryLocale: 'zh-CN',
    entryExtension: '.zh-CN.md',
    outputLocales: ['en-US'],
    outputExtensionsOverrides: {
      'en-US': '.md',
    },
  },
};
