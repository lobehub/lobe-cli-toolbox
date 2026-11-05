import { RecursiveCharacterTextSplitter } from '@lobehub/cli-common/textSplitter';

import type { LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { calcToken } from '@/utils/calcToken';
import {
  convertMarkdownToMdast,
  convertMdastToMarkdown,
  convertMdastToMdastObj,
  mergeMdastObj,
  pickMdastObj,
} from '@/utils/convertMarkdown';
import { getSplitToken } from '@/utils/splitJsonToChunks';

export interface MdastDocument {
  entry: LocaleObj;
  mdast: any;
  /** Text nodes that need translation, keyed by node index. */
  target: LocaleObj;
}

export interface SplitMarkdown {
  chunks: string[];
  /** Link reference definitions, appended untranslated after the chunks. */
  definition: string;
}

/**
 * Stateless, so documents can be translated concurrently with a single instance.
 */
export class TranslateMarkdown {
  config: I18nConfig;
  check: string[];

  constructor(config: I18nConfig) {
    this.config = config;
    this.check = ['text', 'yaml', config?.markdown?.translateCode && 'code'].filter(
      Boolean,
    ) as string[];
  }

  async genTarget(md: string): Promise<MdastDocument> {
    const mdast = await convertMarkdownToMdast(md);
    const entry = convertMdastToMdastObj(mdast, this.check);
    return { entry, mdast, target: pickMdastObj(entry) };
  }

  async genMarkdownByMdast(
    { entry, mdast }: Pick<MdastDocument, 'entry' | 'mdast'>,
    target?: LocaleObj,
  ): Promise<string | undefined> {
    if (!target) return;
    const translatedMdast = mergeMdastObj({ entry, mdast, target }, this.check);
    return convertMdastToMarkdown(translatedMdast);
  }

  async clearMarkdownString(md: string) {
    const definition: any[] = [];
    const mdast = (await convertMarkdownToMdast(md)) as any;
    mdast.children = mdast.children
      .map((node: any) => {
        if (node.type === 'definition') {
          definition.push(node);
          return false;
        }
        return node;
      })
      .filter(Boolean);

    return {
      content: await convertMdastToMarkdown(mdast),
      definition: await convertMdastToMarkdown({
        children: definition,
        type: 'root',
      }),
    };
  }

  async genSplitMarkdown(md: string): Promise<SplitMarkdown> {
    const { content, definition } = await this.clearMarkdownString(md);
    const textSplitter = RecursiveCharacterTextSplitter.fromLanguage('markdown', {
      chunkOverlap: 0,
      chunkSize: getSplitToken(this.config),
      lengthFunction: (text) => calcToken(text),
    });
    return { chunks: await textSplitter.splitText(content), definition };
  }

  genMarkdownByString(translatedMarkdown: string[], definition = '') {
    return [...translatedMarkdown, definition].join('\n\n');
  }
}
