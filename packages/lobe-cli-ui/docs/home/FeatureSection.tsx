import { FeatureGrid, type FeatureGridItem } from '@lobehub/ui/awesome';

import { Blocks, Keyboard, ListTodo, Package, Terminal, Workflow } from './icons';
import { renderLink } from './renderLink';

const FEATURES: FeatureGridItem[] = [
  {
    description: 'Panels, selects, inputs, task lists and alerts shared across Lobe CLIs.',
    href: '/components/panel',
    icon: Blocks,
    title: 'Shared Ink primitives',
  },
  {
    description: 'Wizard chrome with a left rail, status glyphs and footer key hints.',
    href: '/components/panel',
    icon: Workflow,
    title: 'Step-by-step flows',
  },
  {
    description: 'SelectInput, SearchSelect, TextInput and ConfigPanel for real TTY input.',
    href: '/components/select-input',
    icon: Keyboard,
    title: 'Interactive prompts',
  },
  {
    description: 'TaskList and ProgressBar for multi-step jobs with live status.',
    href: '/components/task-list',
    icon: ListTodo,
    title: 'Progress feedback',
  },
  {
    description: 'Docs demos reuse the same Ink modules as the CLIs, shown in a terminal preview.',
    href: '/getting-started',
    icon: Terminal,
    title: 'Terminal-faithful docs',
  },
  {
    description: 'Install @lobehub/cli-ui and use the same components across your CLIs.',
    href: '/getting-started',
    icon: Package,
    title: 'Package ready',
  },
];

export function FeatureSection() {
  return <FeatureGrid items={FEATURES} renderLink={renderLink} />;
}
