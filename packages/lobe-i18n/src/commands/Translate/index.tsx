import { render } from '@lobehub/cli-ui';
import { consola } from 'consola';

import type { LocaleFolderObj, LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { checkLocaleFolders, checkLocales } from '@/utils/checkLocales';
import { getConfigFile } from '@/utils/getConfigFile';
import { getEntryFile, getEntryFolderFiles } from '@/utils/getEntryFile';
import { getLocaleFolderObj, getLocaleObj } from '@/utils/getLocaleObj';
import { splitExtraJSON } from '@/utils/splitJson';

import App from './App';
import { type QueryItemProps } from './QueryItem';

class Translate {
  config: I18nConfig;
  query: QueryItemProps[] = [];
  constructor() {
    this.config = getConfigFile() as I18nConfig;
  }

  start() {
    const isFolder = !this.config.entry.includes('.json') || this.config.entry.includes('*');
    if (isFolder) {
      this.genFolderQuery();
    } else {
      this.genFlatQuery();
    }
    if (this.query.length > 0) {
      render(<App config={this.config} query={this.query} />);
    } else {
      consola.info('No query to translate, everthing is fine');
    }
  }

  genFolderQuery() {
    const config = this.config;
    const entry = getEntryFolderFiles(config) as LocaleFolderObj;
    const files = Object.keys(entry);
    consola.info(`Run in folder mode, found ${files.length} files`);
    checkLocaleFolders(config, files);
    for (const locale of config.outputLocales) {
      for (const filename of files) {
        consola.info(`${locale} - ${filename}`);
        const entryObj = entry[filename] as LocaleObj;
        const targetObj = getLocaleFolderObj(config, locale, filename);
        const splitJSON = splitExtraJSON(config, entryObj, targetObj);
        if (!splitJSON || splitJSON.length === 0) continue;
        this.query.push({
          filename,
          from: config.entryLocale,
          isFolder: true,
          orignalJSON: targetObj,
          splitJSON,
          to: locale,
        });
      }
    }
  }

  genFlatQuery() {
    const config = this.config;
    const entry = getEntryFile(config) as LocaleObj;
    consola.info(`Run in flat mode, found ${Object.keys(entry).length} keys`);
    checkLocales(config);
    for (const locale of config.outputLocales) {
      const entryObj = entry;
      const targetObj = getLocaleObj(config, locale);
      const splitJSON = splitExtraJSON(config, entryObj, targetObj);
      if (!splitJSON || splitJSON.length === 0) continue;
      this.query.push({
        filename: '',
        from: config.entryLocale,
        isFolder: false,
        orignalJSON: targetObj,
        splitJSON,
        to: locale,
      });
    }
  }
}

export default Translate;
