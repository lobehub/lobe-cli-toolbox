/**
 * Whitelist of docs demos that may be executed by the local Ink live runner.
 * Paths are relative to packages/lobe-cli-ui. No arbitrary file/URL execution.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** @typedef {{ id: string, file: string, animated?: boolean, interactive?: boolean }} DemoEntry */

/** @type {Record<string, DemoEntry>} */
export const DEMO_REGISTRY = {
  'Spinner/index': {
    id: 'Spinner/index',
    file: 'src/Spinner/demos/index.tsx',
    animated: true,
    interactive: false,
  },
  'ProgressBar/index': {
    id: 'ProgressBar/index',
    file: 'src/ProgressBar/demos/index.tsx',
    animated: true,
    interactive: false,
  },
  'SelectInput/index': {
    id: 'SelectInput/index',
    file: 'src/SelectInput/demos/index.tsx',
    animated: false,
    interactive: true,
  },
  'TextInput/index': {
    id: 'TextInput/index',
    file: 'src/TextInput/demos/index.tsx',
    animated: false,
    interactive: true,
  },
  'TextInput/field': {
    id: 'TextInput/field',
    file: 'src/TextInput/demos/field.tsx',
    animated: false,
    interactive: true,
  },
  'OptionList/index': {
    id: 'OptionList/index',
    file: 'src/OptionList/demos/index.tsx',
    animated: true,
    interactive: false,
  },
  'SearchSelect/index': {
    id: 'SearchSelect/index',
    file: 'src/SearchSelect/demos/index.tsx',
    animated: false,
    interactive: true,
  },
  'ConfigPanel/index': {
    id: 'ConfigPanel/index',
    file: 'src/ConfigPanel/demos/index.tsx',
    animated: false,
    interactive: true,
  },
  'KeyHints/index': {
    id: 'KeyHints/index',
    file: 'src/KeyHints/demos/index.tsx',
    animated: false,
    interactive: false,
  },
  'Panel/index': {
    id: 'Panel/index',
    file: 'src/Panel/demos/index.tsx',
    animated: false,
    interactive: false,
  },
  'Panel/status': {
    id: 'Panel/status',
    file: 'src/Panel/demos/status.tsx',
    animated: false,
    interactive: false,
  },
  'Panel/intro': {
    id: 'Panel/intro',
    file: 'src/Panel/demos/intro.tsx',
    animated: false,
    interactive: false,
  },
  'TaskList/index': {
    id: 'TaskList/index',
    file: 'src/TaskList/demos/index.tsx',
    animated: true,
    interactive: false,
    script: true,
  },
  'alert/index': {
    id: 'alert/index',
    file: 'src/alert/demos/index.tsx',
    animated: false,
    interactive: false,
    script: true,
  },
};

export function resolveDemoId(id) {
  if (
    typeof id !== 'string' ||
    !id ||
    id.includes('..') ||
    id.includes('\\') ||
    id.startsWith('/')
  ) {
    return null;
  }
  const entry = DEMO_REGISTRY[id];
  if (!entry) return null;
  const abs = path.resolve(root, entry.file);
  if (!abs.startsWith(root + path.sep)) return null;
  return { ...entry, absPath: abs, packageRoot: root };
}

export function demoIdFromAbsPath(absPath) {
  const norm = path.resolve(absPath).replaceAll('\\', '/');
  for (const entry of Object.values(DEMO_REGISTRY)) {
    const full = path.resolve(root, entry.file).replaceAll('\\', '/');
    if (full === norm) return entry.id;
  }
  return null;
}
