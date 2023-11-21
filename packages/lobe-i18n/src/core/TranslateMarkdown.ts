import { checkMdString } from '@/utils/checkMdString';
import {
  convertMarkdownToMdast,
  convertMdastToMarkdown,
  convertMdastToPureObject,
  convertPureObjectToMdast,
} from '@/utils/convertMarkdown';
import { findObjPaths } from '@/utils/findObjPaths';

export class TranslateMarkdown {
  async run(md: string) {
    // 第一步：将 markdown 转换为 mdast 对象
    const mdast = await convertMarkdownToMdast(md);

    // 第二步：将 markdown 转换为 纯对象
    const mdPureObj = convertMdastToPureObject(mdast);

    // 第三部：提取纯对象中 type 为 text 的节点, 并输出对象路径

    // const mdLocale = this.genMdI18nLocale(mdPureObj);

    // 第四部：翻译字符串，然后用 lodash set 将翻译后的字符串设置到纯对象中

    // 第五部：将纯对象转换为 mdast 对象
    const newMdast = convertPureObjectToMdast(mdPureObj);

    // 第六部：将 mdast 对象转换为 markdown
    return await convertMdastToMarkdown(newMdast);
  }

  // getLocale(md:string) {
  //
  // }

  genMdI18nLocale(obj: { path: string; value: string }[]) {
    const toc = findObjPaths(obj, 'text').filter(
      (item) => !checkMdString(item.value, ['\n', 'Note', 'Important', 'Warn']),
    );

    const locale: { [key: string]: string } = {};

    for (const item of toc) {
      locale[item.path] = item.value;
    }

    return locale;
  }
}
