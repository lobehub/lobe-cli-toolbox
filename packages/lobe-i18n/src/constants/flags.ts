type Lang = `${string}_${string}`;
export interface Options {
  apikey: string;
  entry: Lang;
  locales: Lang[];
  output: string;
  proxy?: string;
}

type OptionKeys = keyof Options;

interface CliFlagsItem {
  desc?: string;
  shortFlag?: string;
  type: 'boolean' | 'string';
}

type CliFlagsBase = {
  [key in OptionKeys]: CliFlagsItem;
};

export interface CliFlags extends CliFlagsBase {
  help: CliFlagsItem;
  version: CliFlagsItem;
}

const FLAGS: CliFlags = {
  apikey: { desc: 'The OpenAI API Key', shortFlag: 'k', type: 'string' },
  entry: {
    desc: 'The language that Transmart will use as translation ref',
    shortFlag: 'i',
    type: 'string',
  },
  help: { desc: 'Print basic options', shortFlag: 'h', type: 'boolean' },
  locales: { desc: 'All languages that need to be translated', shortFlag: 'l', type: 'string' },
  output: {
    desc: 'Where you store your locale files',
    shortFlag: 'o',
    type: 'string',
  },
  proxy: {
    desc: 'Optional base url of OpenAI API, useful with proxy',
    shortFlag: 'p',
    type: 'string',
  },
  version: { desc: 'Print lobe-i18n installed version', shortFlag: 'v', type: 'boolean' },
};

export default FLAGS;
