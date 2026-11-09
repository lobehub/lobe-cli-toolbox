import { alert, createTaskList } from '@lobehub/cli-ui';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Script-style demo: createTaskList owns Ink render (FORCE_COLOR=3 TTY).
 * Capture harness detects async default export and does NOT wrap createElement
 * (that would nest a second Ink tree on the same stdout and corrupt CUU frames).
 *
 * Timing is demo-only (not TaskList defaults): slow enough to read each stage,
 * smooth progress steps, and a settled finish pause before stop/loop reset.
 * Capture duration in vite-ink-demo-plugin must cover the full wall time.
 */
export default async function TaskListDemo() {
  const tasks = createTaskList({ tagWidth: 6, total: 2 });

  tasks.start('en', { tag: 'en', title: 'locales/en.json' });
  await wait(700);
  tasks.finish('en', 'done', '12 keys');

  tasks.start('zh', { tag: 'zh', title: 'locales/zh-CN.json' });
  await wait(450);
  // Smooth increments (not 25→55→100 jumps in ~100ms)
  for (const p of [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 100]) {
    tasks.update('zh', { progress: p });
    await wait(220);
  }
  await wait(400);
  tasks.finish('zh', 'done', '12 keys');

  alert.info('All locales updated');
  await wait(1200);
  await tasks.stop();
}
