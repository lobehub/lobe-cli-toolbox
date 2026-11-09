import './gallery.css';

import { Block, cssVar } from '@lobehub/ui';
import { type ComponentType, lazy } from 'react';
import { Link } from 'react-router';

import PanelDemo from '../../src/Panel/demos/index.tsx?demo';
import SelectInputDemo from '../../src/SelectInput/demos/index.tsx?demo';
import TaskListDemo from '../../src/TaskList/demos/index.tsx?demo';
import { HomeDemoPreview } from './HomeDemoPreview';

const PanelPreview = lazy(async () => ({ default: await PanelDemo.load() }));
const SelectInputPreview = lazy(async () => ({ default: await SelectInputDemo.load() }));
const TaskListPreview = lazy(async () => ({ default: await TaskListDemo.load() }));

function DemoCard({ demo, href, title }: { demo: ComponentType; href: string; title: string }) {
  return (
    <Block allowShrink as="article" direction="vertical" gap={12} padding={16} variant="outlined">
      <h3 style={{ color: cssVar.colorText, fontSize: cssVar.fontSizeSM, margin: 0 }}>
        <Link style={{ color: 'inherit', textDecoration: 'none' }} to={href}>
          {title} →
        </Link>
      </h3>
      <HomeDemoPreview demo={demo} />
    </Block>
  );
}

/** Three real Ink previews; cards never own or constrain terminal height. */
export function BentoGallery() {
  return (
    <div className="home-demo-gallery">
      <DemoCard demo={PanelPreview} href="/components/panel" title="Panel" />
      <DemoCard demo={SelectInputPreview} href="/components/select-input" title="SelectInput" />
      <DemoCard demo={TaskListPreview} href="/components/task-list" title="TaskList" />
    </div>
  );
}
