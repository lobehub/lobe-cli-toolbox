/// <reference types="vite/client" />
declare module '*.css';

declare module '*?demo' {
  import type { ComponentType } from 'react';

  interface DemoModule {
    editable: boolean;
    id: string;
    legacyIds: string[];
    load: () => Promise<ComponentType>;
    loadScope: () => Promise<Record<string, unknown>>;
    routeId: string;
    source: string;
    sourcePath: string;
  }

  const demo: DemoModule;
  export default demo;
}
