import type { LocaleObj } from '@/types';

/** The string values of `keys` in the front matter, other types are not translatable. */
export const pickMatter = (data: LocaleObj, keys: string[] = []): LocaleObj => {
  const picked: LocaleObj = {};
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' && value.trim() !== '') picked[key] = value;
  }
  return picked;
};
