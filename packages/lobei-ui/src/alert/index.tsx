import { consola } from 'consola';
import process from 'node:process';

export default {
  error: (text: string, exit?: boolean) => {
    consola.error(text);
    if (exit) {
      process.exit(1);
    }
  },
  info: (text: string, exit?: boolean) => {
    consola.info(text);
    if (exit) {
      process.exit(0);
    }
  },
  success: (text: string, exit?: boolean) => {
    consola.success(text);
    if (exit) {
      process.exit(0);
    }
  },
  warn: (text: string, exit?: boolean) => {
    consola.warn(text);
    if (exit) {
      process.exit(0);
    }
  },
};
