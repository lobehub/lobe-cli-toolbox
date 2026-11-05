declare module 'ansi-to-html' {
  type Options = {
    fg?: string;
    bg?: string;
    newline?: boolean;
    escapeXML?: boolean;
    stream?: boolean;
    colors?: Record<string | number, string>;
  };
  export default class Convert {
    constructor(options?: Options);
    toHtml(data: string): string;
  }
}
