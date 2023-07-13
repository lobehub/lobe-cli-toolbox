import { consola } from 'consola';

import type { LocaleFolderObj, LocaleObj } from '@/types';
import type { I18nConfig } from '@/types/config';
import { checkLocaleFolders, checkLocales } from '@/utils/checkLocales';
import { getConfigFile } from '@/utils/getConfigFile';
import { getEntryFile, getEntryFolderFiles } from '@/utils/getEntryFile';
import { getLocaleFolderObj, getLocaleObj } from '@/utils/getLocaleObj';
import { setLocaleFolderObj, setLocaleObj } from '@/utils/setLocaleObj';

import { runTranslate } from './runTranslate';

class Translate {
  config: I18nConfig;
  constructor() {
    this.config = getConfigFile() as I18nConfig;
  }

  start() {
    const isFolder = !this.config.entry.includes('.json') || this.config.entry.includes('*');
    if (isFolder) {
      this.runFolder(this.config);
    } else {
      this.runFlat(this.config);
    }
  }

  runFolder(config: I18nConfig) {
    const entry = getEntryFolderFiles(config) as LocaleFolderObj;
    const files = Object.keys(entry);
    consola.info(`Run in folder mode, found ${files.length} files`);
    checkLocaleFolders(config, files);
    for (const locale of config.outputLocales) {
      for (const filename of files) {
        consola.info(`${locale} - ${filename}`);
        const entryObj = entry[filename] as LocaleObj;
        const targetObj = getLocaleFolderObj(config, locale, filename);
        const translateObj = runTranslate(
          {
            locale: config.entryLocale,
            obj: entryObj,
          },
          {
            locale: locale,
            obj: targetObj,
          },
        );
        if (!translateObj) continue;
        setLocaleFolderObj(config, locale, filename, targetObj);
      }
    }
  }

  runFlat(config: I18nConfig) {
    const entry = getEntryFile(config) as LocaleObj;
    consola.info(`Run in flat mode, found ${Object.keys(entry).length} keys`);
    checkLocales(config);
    for (const locale of config.outputLocales) {
      consola.info(`${locale}`);
      const entryObj = entry;
      const targetObj = getLocaleObj(config, locale);
      const translateObj = runTranslate(
        {
          locale: config.entryLocale,
          obj: entryObj,
        },
        {
          locale: locale,
          obj: targetObj,
        },
      );
      if (!translateObj) continue;
      setLocaleObj(config, locale, translateObj);
    }
  }
}

export default Translate;
