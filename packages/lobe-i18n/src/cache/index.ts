import { Kv, openKv } from '@deno/kv';
import crypto from 'node:crypto';

export class FileHashCache {
  kv: Promise<Kv>;
  constructor(cacheDB = '.lobe-i18n.db') {
    this.kv = openKv(cacheDB);
  }
  getHash(fileContent: string) {
    return crypto.createHash('md5').update(fileContent).digest('hex');
  }
  setHash(filePath: string, key: string) {
    return this.kv.then((kv) => {
      return kv.set(['files', filePath], key);
    });
  }
  hasHash(filePath: string, key: string) {
    return this.kv
      .then((kv) => {
        return kv.get<string>(['files', filePath]);
      })
      .then((res) => {
        return res.value === key;
      });
  }
  remove(filePath: string) {
    return this.kv.then((kv) => kv.delete(['files', filePath]));
  }
  clear() {
    return this.kv.then(async (kv) => {
      const iter = kv.list<string>({ prefix: ['files'] });
      for await (const res of iter) kv.delete(res.key);
    });
  }
  destory() {
    return this.kv.then((kv) => kv.close());
  }
}
