import { LocaleObj } from '@/types';
import {
  convertMarkdownToMdast,
  convertMdastToMarkdown,
  convertMdastToMdastObj,
  mergeMdastObj,
  pickMdastObj,
} from '@/utils/convertMarkdown';

export class TranslateMarkdown {
  mdast: any;
  entry: LocaleObj = {};
  async genTarget(md: string) {
    this.mdast = await convertMarkdownToMdast(md);
    this.entry = convertMdastToMdastObj(this.mdast);
    return pickMdastObj(this.entry);
  }
  async genMarkdown(target?: LocaleObj): Promise<string | undefined> {
    if (!target) return;
    const translatedMdast = mergeMdastObj(this.mdast, this.entry, target);
    return convertMdastToMarkdown(translatedMdast);
  }
}
