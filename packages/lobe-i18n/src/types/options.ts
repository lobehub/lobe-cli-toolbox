export interface Options {
  /**
   * @description The entry file or folder
   */
  entry: string;
  /**
   * @description The language that will use as translation ref
   */
  entryLocale: string;
  /**
   * @description Where you store your locale files
   */
  output: string;
  /**
   * @description All languages that need to be translated
   */
  outputLocales: string[];
}
