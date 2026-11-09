import { type ComponentType, type CSSProperties, Suspense, useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;
const shellStyle: CSSProperties = {
  maxWidth: '100%',
  minWidth: 0,
  overflowX: 'auto',
  width: '100%',
};

/** SSR-safe gate: lazy Ink modules load only after hydration, with natural height. */
export function HomeDemoPreview({ demo: DemoComponent }: { demo: ComponentType }) {
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  if (!hydrated) return <div aria-hidden style={shellStyle} />;
  return (
    <Suspense fallback={<div aria-hidden style={shellStyle} />}>
      <div data-pagefind-ignore="all" style={shellStyle}>
        <DemoComponent />
      </div>
    </Suspense>
  );
}
