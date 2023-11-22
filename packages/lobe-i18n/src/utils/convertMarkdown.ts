import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import { LocaleObj } from '@/types';
import { checkMdString } from '@/utils/checkMdString';

// @ts-ignore
export const convertMarkdownToMdast = async (md: string) => {
  // @ts-ignore
  return unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter).parse(md.trim());
};

export const convertMdastToMdastObj = (mdast: any, check?: string[]) => {
  const obj: LocaleObj = {};
  let index = 0;

  visit(mdast, check || 'text', (node) => {
    obj[index] = node.value;
    index++;
  });

  return obj;
};

export const pickMdastObj = (entry: LocaleObj) => {
  const obj: LocaleObj = {};
  for (const [key, value] of Object.entries(entry)) {
    if (checkMdString(value as string)) continue;
    obj[Number(key)] = value;
  }
  return obj;
};

export const mergeMdastObj = (
  { mdast, entry, target }: { entry: LocaleObj; mdast: any; target: LocaleObj },
  check?: string[],
) => {
  const merged = { ...entry, ...target };

  let index = 0;

  visit(mdast, check || 'text', (node) => {
    node.value = merged[index];
    index++;
  });

  return mdast;
};

export const convertMdastToMarkdown = async (json: any): Promise<string> => {
  // @ts-ignore
  return (
    unified()
      // @ts-ignore
      .use(remarkStringify, {
        bullet: '-',
        emphasis: '*',
        fences: true,
        listItemIndent: 1,
        rule: '-',
        strong: '*',
        tightDefinitions: true,
      })
      // @ts-ignore
      .use(remarkFrontmatter)
      // @ts-ignore
      .use(remarkGfm)
      .stringify(json)
  );
};
