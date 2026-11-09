import { captureInkDemoFile } from './capture-ink-ansi.mjs';

const file = process.argv[2];
const ansi = await captureInkDemoFile(file, { settleMs: 120 });
process.stdout.write(ansi);
