export const isEqualJsonKeys = (obj1: any, obj2: any): boolean => {
  try {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== typeof obj2) return false;

    if (typeof obj1 === 'object' && typeof obj2 === 'object') {
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) return false;

      for (const key of keys1) {
        if (!keys2.includes(key) || !isEqualJsonKeys(obj1[key], obj2[key])) {
          return false;
        }
      }
    }
    return typeof obj1 === typeof obj2;
  } catch {
    return false;
  }
};
