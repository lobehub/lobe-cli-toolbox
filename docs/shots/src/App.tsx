import { ShotScene } from './scenes/ShotScene';

function resolveSrc(): string {
  const params = new URLSearchParams(window.location.search);
  const src = params.get('src');
  if (src) return src;
  const scene = params.get('scene');
  if (scene) return `/fixtures/${scene}.ansi`;
  return '/fixtures/commit-type.ansi';
}

function resolveShotId(src: string): string {
  const params = new URLSearchParams(window.location.search);
  const scene = params.get('scene');
  if (scene) return scene;
  const base = src.split('?')[0].split('/').pop() || 'shot';
  return base.replace(/\.ansi$/i, '') || 'shot';
}

export default function App() {
  const src = resolveSrc();
  const shotId = resolveShotId(src);

  return (
    <div data-scene={shotId}>
      <ShotScene shotId={shotId} src={src} />
    </div>
  );
}
