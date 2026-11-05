export const KEYS = {
  down: '\u001B[B',
  enter: '\r',
  esc: '\u001B',
  up: '\u001B[A',
};

export const tick = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 20);
  });

/** Writes each key separately and lets Ink re-render in between. */
export const press = async (stdin: { write: (data: string) => void }, ...keys: string[]) => {
  for (const key of keys) {
    stdin.write(key);
    await tick();
  }
};
