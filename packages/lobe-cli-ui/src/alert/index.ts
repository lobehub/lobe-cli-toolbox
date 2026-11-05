import { consola } from 'consola';

interface Alert {
  /** Logs `text`; with `exit: true` the process exits right away. */
  (text: string, exit: true): never;
  (text: string, exit?: boolean): void;
}

const create = (type: 'error' | 'info' | 'success' | 'warn', exitCode: number) =>
  ((text: string, exit?: boolean) => {
    consola[type](text);
    if (exit) process.exit(exitCode);
  }) as Alert;

const alert: Record<'error' | 'info' | 'success' | 'warn', Alert> = {
  error: create('error', 1),
  info: create('info', 0),
  success: create('success', 0),
  warn: create('warn', 0),
};

export default alert;
