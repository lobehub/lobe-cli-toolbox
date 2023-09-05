export const dealStringToArr = (para: string): string[] => {
  /**
   * in  'x1,x2,x3'
   * out ['x1','x2','x3']
   */
  let arr: string[] = [];
  if (para) {
    const paraArr = para.split(',');
    for (const it of paraArr) {
      if (it.trim()) {
        arr.push(it.trim());
      }
    }
  }
  return arr;
};
