import { consola } from 'consola';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const Shebang = (targetFilePath: string, shebang: string = '#!/usr/bin/env node') => {
  const filePath = resolve(targetFilePath);

  const isExist = existsSync(filePath);

  if (!isExist) return consola.error('File is not exist');

  const data = readFileSync(filePath, 'utf8');

  if (!data) return consola.warn('File is not empty');

  if (data.includes('#!/usr/bin/env')) return consola.warn('This file aready has a shebang');

  const newContent = `${shebang}\n${data}`;

  writeFileSync(filePath, newContent, 'utf8');

  consola.success(`🪧 Shebang added to ${filePath}`);
};

export default Shebang;
