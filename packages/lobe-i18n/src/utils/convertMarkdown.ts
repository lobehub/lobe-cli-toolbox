import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';

import { isNumeric } from '@/utils/isNumeric';

export const convertMarkdownToMdast = async (md: string) => {
  return await unified().use(remarkParse).use(remarkGfm).parse(md);
};

export const convertMdastToMarkdown = async (json: any) => {
  return await unified().use(remarkStringify).use(remarkGfm).stringify(json);
};

export const convertMdastToPureObject = (obj: any) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  let newObj: any = Array.isArray(obj) ? {} : {};
  for (let key in obj) {
    if (key === 'children' && Array.isArray(obj[key])) {
      newObj[key] = obj[key].length > 0 ? {} : [];
      for (let i = 0; i < obj[key].length; i++) {
        newObj[key][i] = convertMdastToPureObject(obj[key][i]);
      }
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      newObj[key] = convertMdastToPureObject(obj[key]);
    } else {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

export const convertPureObjectToMdast = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  let newObj: any = Array.isArray(obj) ? [] : {};
  for (let key in obj) {
    // eslint-disable-next-line no-prototype-builtins
    if (obj.hasOwnProperty(key)) {
      if (isNumeric(key) && !Array.isArray(newObj)) {
        newObj = Object.values(newObj);
      }
      newObj[key] = convertPureObjectToMdast(obj[key]);
    }
  }
  return newObj;
};
