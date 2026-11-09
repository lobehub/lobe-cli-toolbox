import { alert } from '@lobehub/cli-ui';

/** Script-style demo captured via consola ANSI under FORCE_COLOR=3. */
export default async function AlertDemo() {
  alert.success('Committed');
  alert.info('Nothing to do');
  alert.warn('Using fallback model');
  // Do not exit: capture the error log only.
  alert.error('Missing API key');
  await new Promise((r) => setTimeout(r, 20));
}
