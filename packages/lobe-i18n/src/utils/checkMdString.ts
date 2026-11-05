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
  // 只包含空白、标点和符号（\p{S} 已涵盖 emoji）的字符串无需翻译
  const regex = /^[\s\p{P}\p{S}]*$/u;
  return regex.test(str.replaceAll(' ', ''));
};
