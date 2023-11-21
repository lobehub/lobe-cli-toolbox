const IGNORE_LIST = new Set([
  '\n',
  '\r\n',
  '[!NOTE]',
  '[!IMPORTANT]',
  '[!WARNING]',
  '[!CAUTION]',
  '\\[!NOTE]',
  '\\[!IMPORTANT]',
  '\\[!WARNING]',
  '\\[!CAUTION]',
  '\\[!NOTE]\\',
  '\\[!IMPORTANT]\\',
  '\\[!WARNING]\\',
  '\\[!CAUTION]\\',
]);

export const checkMdString = (str: string) => {
  if (IGNORE_LIST.has(str)) return true;
  // 创建一个正则表达式，包含所有的标点符号、空格和emoji
  // 表情的Unicode范围是：U+1F300到U+1F5FF，U+1F600到U+1F64F，U+1F680到U+1F6FF，U+1F700到U+1F77F
  let regex =
    /^[\s\p{P}\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}]*$/u;
  return regex.test(str.replaceAll(' ', ''));
};
