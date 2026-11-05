import { describe, expect, it } from 'vitest';

import { createLimiter } from './limiter';

const tick = () => new Promise((resolve) => setTimeout(resolve, 1));

describe('createLimiter', () => {
  it('never runs more than `concurrency` tasks at once', async () => {
    const limit = createLimiter(2);
    let active = 0;
    let peak = 0;

    await Promise.all(
      Array.from({ length: 8 }, () =>
        limit(async () => {
          active++;
          peak = Math.max(peak, active);
          await tick();
          active--;
        }),
      ),
    );

    expect(peak).toBe(2);
  });

  it('starts tasks in submission order', async () => {
    const limit = createLimiter(1);
    const order: number[] = [];
    await Promise.all([1, 2, 3].map((n) => limit(async () => void order.push(n))));
    expect(order).toEqual([1, 2, 3]);
  });

  it('keeps going after a task rejects', async () => {
    const limit = createLimiter(1);
    const failed = limit(() => Promise.reject(new Error('boom')));
    const next = limit(async () => 'ok');

    await expect(failed).rejects.toThrow('boom');
    await expect(next).resolves.toBe('ok');
  });

  it('falls back to 1 for invalid concurrency', async () => {
    const limit = createLimiter(0);
    await expect(limit(async () => 1)).resolves.toBe(1);
  });
});
