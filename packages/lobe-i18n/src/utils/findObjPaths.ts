export const findObjPaths = (obj: any, feature: string, path = '', paths: any[] = []) => {
  for (let key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      findObjPaths(obj[key], feature, `${path}${path ? '.' : ''}${key}`, paths);
    } else if (key === 'type' && obj[key] === feature && obj['value']) {
      paths.push({ path: `${path}${path ? '.' : ''}value`, value: obj['value'] });
    }
  }
  return paths;
};
