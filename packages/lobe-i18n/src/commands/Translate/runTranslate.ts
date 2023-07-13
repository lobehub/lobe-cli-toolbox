import { LocaleObj } from '@/types';
import { getExtraObj } from '@/utils/getExtraObj';
import { splitJSONtoSmallChunks } from '@/utils/splitJson';

export const runTranslate = (
  entry: {
    locale: string;
    obj: LocaleObj;
  },
  target: {
    locale: string;
    obj: LocaleObj;
  },
): LocaleObj | false => {
  const untranslateObj = getExtraObj(entry.obj, target.obj);
  if (Object.keys(untranslateObj).length === 0) return false;
  const splitObj = splitJSONtoSmallChunks(untranslateObj);
  console.log(splitObj);
  return false;
};
