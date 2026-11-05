import { readFileSync, writeFileSync } from 'node:fs';

import stringify from 'json-stable-stringify';

export const readJSON = (filePath: string) => {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export const writeJSON = (filePath: string, data: any) => {
  const jsonStr = stringify(data, { space: '  ' });
  writeFileSync(filePath, jsonStr + '\r\n', 'utf8');
};

export const readMarkdown = (filePath: string): string => {
  return readFileSync(filePath, 'utf8');
};

export const writeMarkdown = (filePath: string, data: string) => {
  writeFileSync(filePath, data, 'utf8');
};
