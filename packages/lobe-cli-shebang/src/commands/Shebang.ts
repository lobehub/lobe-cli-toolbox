import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { consola } from 'consola';

export const DEFAULT_SHEBANG = '#!/usr/bin/env node';

/** Returns `content` with `shebang` as its first line, or `undefined` if it already has one. */
export const addShebang = (content: string, shebang: string = DEFAULT_SHEBANG) => {
  if (content.startsWith('#!')) return;
  return `${shebang}\n${content}`;
};

/** Adds a shebang to the file, returning `false` when the file could not be updated. */
const Shebang = (targetFilePath: string, shebang: string = DEFAULT_SHEBANG): boolean => {
  const filePath = resolve(targetFilePath);

  if (!existsSync(filePath)) {
    consola.error(`File does not exist: ${filePath}`);
    return false;
  }

  const data = readFileSync(filePath, 'utf8');
  if (!data) {
    consola.warn(`File is empty: ${filePath}`);
    return false;
  }

  const content = addShebang(data, shebang);
  if (!content) {
    consola.info(`File already has a shebang: ${filePath}`);
    return true;
  }

  writeFileSync(filePath, content, 'utf8');
  consola.success(`🪧 Shebang added to ${filePath}`);
  return true;
};

export default Shebang;
