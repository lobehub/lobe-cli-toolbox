import symbols from '../styles/symbols';

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

/**
 * Monochrome geometric icons (same family as Panel `styles/symbols`).
 * Not consola FancyReporter (⚠/✔/ℹ) — those get colorful emoji presentation on Windows.
 * Message text is unchanged, so user-provided emoji in `text` still render.
 */
const ICONS: Record<AlertType, string> = {
  error: symbols.error, // ▲ U+25B2
  info: '●', // U+25CF — avoid ℹ (U+2139) emoji presentation
  success: '✓', // U+2713 — avoid ✔ (U+2714) emoji presentation
  warn: symbols.warning, // ▲ U+25B2 — same glyph as error; color 33/yellow vs 31/red
};

const CSI = '\x1B[';
const color: Record<AlertType, string> = {
  error: `${CSI}31m`,
  info: `${CSI}36m`,
  success: `${CSI}32m`,
  warn: `${CSI}33m`,
};
const reset = `${CSI}39m`;

function writeAlert(type: AlertType, text: string) {
  const line = `${color[type]}${ICONS[type]}${reset} ${text}`;
  // Always stdout: docs capture worker only records stdout (stderr discarded on success).
  process.stdout.write(`${line}\n`);
}

const create = (type: AlertType, exitCode: number) =>
  ((text: string, exit?: boolean) => {
    if (sink && !exit) return sink.log(type, text);
    sink?.stop();
    sink = undefined;
    writeAlert(type, text);
    if (exit) process.exit(exitCode);
  }) as Alert;

const alert: Record<AlertType, Alert> = {
  error: create('error', 1),
  info: create('info', 0),
  success: create('success', 0),
  warn: create('warn', 0),
};

export default alert;
