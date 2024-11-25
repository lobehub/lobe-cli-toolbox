import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import type { Node } from 'unist';
import { visit } from 'unist-util-visit';

import { LocaleObj } from '@/types';
import { checkMdString } from '@/utils/checkMdString';

export const convertMarkdownToMdast = async (md: string): Promise<Node> => {
  return unified()
    .use(remarkParse as any)
    .use(remarkGfm as any)
    .use(remarkFrontmatter as any)
    .parse(md.trim());
};

export const convertMdastToMdastObj = (mdast: Node, check?: string[]): LocaleObj => {
  const obj: LocaleObj = {};
  let index = 0;

  visit(mdast, check || 'text', (node: any) => {
    obj[index] = node.value;
    index++;
  });

  return obj;
};

export const pickMdastObj = (entry: LocaleObj): LocaleObj => {
  const obj: LocaleObj = {};
  for (const [key, value] of Object.entries(entry)) {
    if (checkMdString(value as string)) continue;
    obj[Number(key)] = value;
  }
  return obj;
};

export const mergeMdastObj = (
  { mdast, entry, target }: { entry: LocaleObj; mdast: Node; target: LocaleObj },
  check?: string[],
) => {
  const merged = { ...entry, ...target };

  let index = 0;

  visit(mdast, check || 'text', (node: any) => {
    node.value = merged[index];
    index++;
  });

  return mdast;
};

export const convertMdastToMarkdown = async (json: any): Promise<string> => {
  return unified()
    .use(remarkStringify as any, {
      bullet: '-',
      emphasis: '*',
      fences: true,
      listItemIndent: 1,
      rule: '-',
      strong: '*',
      tightDefinitions: true,
    })
    .use(remarkFrontmatter as any)
    .use(remarkGfm as any)
    .stringify(json)
    .toString();
};
