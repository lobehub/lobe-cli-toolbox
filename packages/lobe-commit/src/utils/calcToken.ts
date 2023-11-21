import { encode } from 'gpt-tokenizer';

export const calcToken = (str: any) => {
  return encode(String(str)).length;
};
