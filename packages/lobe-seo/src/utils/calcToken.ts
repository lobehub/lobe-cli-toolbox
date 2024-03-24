import { encode } from 'gpt-tokenizer';

export const calcToken = (str: string) => {
  return encode(str).length;
};
