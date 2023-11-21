import { readFileSync, writeFileSync } from 'node:fs';

export const readJSON = (filePath: string) => {
  const data = readFileSync(filePath, 'utf8');
  return JSON.parse(data);
};

export const writeJSON = (filePath: string, data: any) => {
  const jsonStr = JSON.stringify(data, null, 2);
  writeFileSync(filePath, jsonStr, 'utf8');
};

export const readMarkdown = (filePath: string): string => {
  return readFileSync(filePath, 'utf8');
};

export const writeMarkdown = (filePath: string, data: string) => {
  writeFileSync(filePath, data, 'utf8');
};
