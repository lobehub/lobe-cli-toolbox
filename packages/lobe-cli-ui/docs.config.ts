export default {
  // Official docs-kit extension module (see docs.vite.ts).
  vite: './docs.vite.ts',
  homePage: './docs/home/home.tsx',
  alias: {
    '@': 'src',
    '@lobehub/cli-ui': 'src',
    // Vite serves the CJS shim via /@fs without named-export interop, which breaks
    // client hydration (demos stuck on "Loading preview"). Re-export React 19's hook.
    'use-sync-external-store': 'docs/shims/use-sync-external-store',
  },
  atomDirs: [{ dir: 'src' }],
  description:
    'Ink (React for CLIs) components shared by the Lobe CLI tools — panels, selects, inputs, task lists and alerts.',
  publicDocs: ['docs/getting-started.mdx'],
  siteUrl: 'https://cli-ui.lobehub.com',
  themeConfig: {
    apiHeader: {
      docUrl: '{github}/edit/master/packages/lobe-cli-ui/{atomId}',
      github: 'https://github.com/lobehub/lobe-cli-toolbox',
      match: ['/components/'],
      packageName: '@lobehub/cli-ui',
      sourceUrl: '{github}/tree/master/packages/lobe-cli-ui/{atomId}',
    },
    navItems: [{ href: '/getting-started', icon: 'rocket', label: 'Getting Started' }],
    prefersColor: 'auto',
    sidebarGroups: [
      { dir: 'docs/getting-started.mdx', icon: 'book-open', order: -1, title: 'Guides' },
    ],
    socialLinks: [
      {
        href: 'https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-cli-ui',
        icon: 'github',
        label: 'GitHub',
      },
    ],
  },
  title: 'Lobe CLI UI',
};
