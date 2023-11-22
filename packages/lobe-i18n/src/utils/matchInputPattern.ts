import { join } from 'node:path';

export const matchInputPattern = (filepaths: string[], extention: string) => {
  return filepaths.map((filepath) => {
    if (filepath.includes('*') || filepath.includes(extention)) return filepath;
    return join(filepath, `**/*${extention}`).replaceAll('\\', '/');
  });
};
