export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

/**
 * FIFO limiter shared by every file and locale, so `concurrency` bounds the total number of
 * in-flight LLM requests instead of the requests of a single file.
 */
export const createLimiter = (concurrency: number): Limiter => {
  const max = Number.isFinite(concurrency) && concurrency > 0 ? Math.floor(concurrency) : 1;
  const queue: Array<() => void> = [];
  let active = 0;

  const next = () => {
    if (active >= max) return;
    const run = queue.shift();
    if (!run) return;
    active++;
    run();
  };

  return (task) =>
    new Promise((resolve, reject) => {
      queue.push(() => {
        task()
          .then(resolve, reject)
          .finally(() => {
            active--;
            next();
          });
      });
      next();
    });
};
