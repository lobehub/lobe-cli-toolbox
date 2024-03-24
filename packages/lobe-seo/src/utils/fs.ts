import { readFileSync, writeFileSync } from 'node:fs';

export const readMarkdown = (filePath: string): string => {
  return readFileSync(filePath, 'utf8');
};

export const writeMarkdown = (filePath: string, data: string) => {
  writeFileSync(filePath, data, 'utf8');
};
