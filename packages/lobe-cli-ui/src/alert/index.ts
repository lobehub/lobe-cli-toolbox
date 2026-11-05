import { consola } from 'consola';

export type AlertType = 'error' | 'info' | 'success' | 'warn';

interface Alert {
  /** Logs `text`; with `exit: true` the process exits right away. */
  (text: string, exit: true): never;
  (text: string, exit?: boolean): void;
}

/** Receives alerts while a live view (e.g. a task list) owns the terminal. */
export interface AlertSink {
  log: (type: AlertType, text: string) => void;
  /** Called before a fatal alert exits, to restore the terminal. */
  stop: () => void;
}

let sink: AlertSink | undefined;

export const setAlertSink = (next: AlertSink | undefined) => {
  sink = next;
};

const create = (type: AlertType, exitCode: number) =>
  ((text: string, exit?: boolean) => {
    if (sink && !exit) return sink.log(type, text);
    sink?.stop();
    sink = undefined;
    consola[type](text);
    if (exit) process.exit(exitCode);
  }) as Alert;

const alert: Record<AlertType, Alert> = {
  error: create('error', 1),
  info: create('info', 0),
  success: create('success', 0),
  warn: create('warn', 0),
};

export default alert;
