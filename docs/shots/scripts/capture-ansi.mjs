/**
 * Capture real CLI ANSI into docs/shots/fixtures/.
 *
 * Usage:
 *   node scripts/capture-ansi.mjs
 *   node scripts/capture-ansi.mjs commit-type preview-ai preview-editor lobe-i18n-preview
 *
 * Requires: lobe-commit / lobe-i18n / lobe-label on PATH (nvm login shell), python3+pty.
 * AI / i18n scenes need network + configured API keys.
 */
import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const fixturesDir = path.resolve(root, 'fixtures');

const DOWN = '\u001B[B';
const ENTER = '\r';

function pyCapture({ cmd, args, cwd, rows, cols, keys, readyBytes, settle, timeout }) {
  const payload = {
    cmd,
    args,
    cwd,
    rows,
    cols,
    keys: keys ?? [],
    readyBytes: readyBytes ?? [],
    settle,
    timeout,
  };
  const b64 = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64');
  return `
import os, pty, select, time, fcntl, struct, termios, sys, json, base64
cfg = json.loads(base64.b64decode(${JSON.stringify(b64)}).decode())
os.environ.setdefault("TERM", "xterm-256color")
os.environ.setdefault("COLORTERM", "truecolor")
os.environ.setdefault("FORCE_COLOR", "3")
os.chdir(cfg["cwd"])
master, slave = pty.openpty()
fcntl.ioctl(slave, termios.TIOCSWINSZ, struct.pack("HHHH", int(cfg["rows"]), int(cfg["cols"]), 0, 0))
pid = os.fork()
if pid == 0:
    os.setsid()
    os.dup2(slave, 0); os.dup2(slave, 1); os.dup2(slave, 2)
    if slave > 2: os.close(slave)
    os.close(master)
    os.execvp(cfg["cmd"], [cfg["cmd"], *cfg["args"]])
    os._exit(1)
os.close(slave)
buf = b""
deadline = time.time() + float(cfg["timeout"])
keys = cfg["keys"]
ready = [x.encode("utf-8") for x in cfg["readyBytes"]]
key_i = 0
settled_at = None

def read_available(extra=0.0):
    global buf
    end = time.time() + extra
    while True:
        to = max(0.0, end - time.time()) if extra else 0.05
        r, _, _ = select.select([master], [], [], to)
        if master not in r:
            if extra and time.time() < end:
                continue
            break
        try:
            chunk = os.read(master, 65536)
        except OSError:
            return False
        if not chunk:
            return False
        buf += chunk
    return True

while time.time() < deadline:
    if not read_available(0.15):
        break
    while key_i < len(keys):
        step = keys[key_i]
        wait_for = step.get("waitFor")
        if wait_for and wait_for.encode("utf-8") not in buf:
            break
        if step.get("sleep"):
            time.sleep(float(step["sleep"]))
            read_available(0.2)
        send = step.get("send")
        if send is not None:
            data = send.encode("utf-8") if isinstance(send, str) else bytes(send)
            os.write(master, data)
            time.sleep(0.12)
            read_available(0.25)
        key_i += 1
    ready_ok = (not ready) or all(x in buf for x in ready)
    if ready_ok and key_i >= len(keys):
        if settled_at is None:
            settled_at = time.time()
        if time.time() - settled_at >= float(cfg["settle"]):
            read_available(0.4)
            break

try: os.kill(pid, 9)
except ProcessLookupError: pass
try: os.waitpid(pid, 0)
except ChildProcessError: pass
sys.stdout.buffer.write(buf)
`;
}

async function runPythonCapture(py) {
  return new Promise((resolve, reject) => {
    const child = spawn('python3', ['-c', py], {
      env: { ...process.env },
      stdio: ['ignore', 'pipe', 'inherit'],
    });
    const chunks = [];
    child.stdout.on('data', (c) => chunks.push(c));
    child.on('exit', (code) => {
      if (code !== 0) reject(new Error(`capture python exit ${code}`));
      else resolve(Buffer.concat(chunks));
    });
  });
}

async function prepareCommitDemo(demo) {
  await fs.rm(demo, { recursive: true, force: true });
  await fs.mkdir(demo, { recursive: true });
  const run = (cmd, args) =>
    new Promise((resolve, reject) => {
      const child = spawn(cmd, args, { cwd: demo, stdio: 'ignore' });
      child.on('exit', (code) =>
        code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} => ${code}`)),
      );
    });
  await run('git', ['init', '-q']);
  await run('git', ['config', 'user.email', 'demo@lobehub.com']);
  await run('git', ['config', 'user.name', 'Demo']);
  await fs.writeFile(path.join(demo, 'app.js'), 'console.log(1)\n');
  await run('git', ['add', 'app.js']);
  await run('git', ['commit', '-qm', 'chore: init']);
  await fs.writeFile(path.join(demo, 'app.js'), 'console.log(1)\nconsole.log(2)\n');
  await run('git', ['add', 'app.js']);
}

function pickBestI18nFrame(buf) {
  const esc = '\u001B';
  const open = `${esc}[?2026h`;
  const close = `${esc}[?2026l`;
  const parts = buf.toString('binary').split(open);
  let best = null;
  for (let i = 1; i < parts.length; i++) {
    const body = parts[i].split(close)[0];
    if (!body.includes('zh_CN') || !body.includes('ja_JP')) continue;
    let score = body.length;
    if (body.includes('✔') || body.includes('\u2714')) score += 5000;
    if (body.includes('1/2 done')) score += 2000;
    if (body.includes('100%')) score += 500;
    if (!best || score > best.score) best = { score, i, body };
  }
  if (!best) return buf;
  // Keep preamble + chosen synchronized frame (real capture, just select best paint)
  const prefix = Buffer.from(parts[0], 'binary');
  const frame = Buffer.from(open + best.body + close + '\n', 'binary');
  return Buffer.concat([prefix, frame]);
}

async function writeFixture(name, buf, mustInclude) {
  for (const s of mustInclude) {
    if (!buf.includes(Buffer.from(s))) {
      const tail = buf.toString('utf8', Math.max(0, buf.length - 800));
      throw new Error(
        `${name}: missing ${JSON.stringify(s)} (${buf.length} bytes). Tail:\n${tail}`,
      );
    }
  }
  const out = path.join(fixturesDir, `${name}.ansi`);
  await fs.mkdir(fixturesDir, { recursive: true });
  await fs.writeFile(out, buf);
  console.log(`[capture] wrote ${out} (${buf.length} bytes)`);
  return out;
}

async function captureCommitType() {
  const demo = path.join(tmpdir(), 'lobe-commit-demo-type');
  await prepareCommitDemo(demo);
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-commit',
      args: [],
      cwd: demo,
      rows: 28,
      cols: 72,
      keys: [],
      readyBytes: ['Commit type', 'feat', 'chore'],
      settle: 0.8,
      timeout: 15,
    }),
  );
  await writeFixture('commit-type', out, ['Commit type', 'feat']);
  await fs.copyFile(
    path.join(fixturesDir, 'commit-type.ansi'),
    path.join(fixturesDir, 'preview.ansi'),
  );
  console.log('[capture] also wrote fixtures/preview.ansi');
}

async function capturePreviewAi() {
  const demo = path.join(tmpdir(), 'lobe-commit-demo-ai');
  await prepareCommitDemo(demo);
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-commit',
      args: [],
      cwd: demo,
      rows: 32,
      cols: 80,
      keys: [{ waitFor: 'Commit type', sleep: 0.6, send: ENTER }],
      readyBytes: ['AI commit message', 'Regenerate', 'commit with this message'],
      settle: 1,
      timeout: 90,
    }),
  );
  await writeFixture('preview-ai', out, ['AI commit message', 'Regenerate']);
}

async function capturePreviewEditor() {
  const demo = path.join(tmpdir(), 'lobe-commit-demo-editor');
  await prepareCommitDemo(demo);
  const subject = 'improve commit wizard UX';
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-commit',
      args: [],
      cwd: demo,
      rows: 32,
      cols: 80,
      keys: [
        { waitFor: 'Commit type', sleep: 0.5, send: DOWN },
        { sleep: 0.25, send: ENTER },
        { waitFor: 'Scope', sleep: 0.45, send: ENTER },
        { waitFor: 'Subject', sleep: 0.35, send: subject },
        { sleep: 0.2, send: ENTER },
      ],
      readyBytes: ['Link issues', 'feat'],
      settle: 1.2,
      timeout: 35,
    }),
  );
  await writeFixture('preview-editor', out, ['Link issues', 'feat']);
}

async function prepareI18nDemo(demo) {
  await fs.rm(demo, { recursive: true, force: true });
  await fs.mkdir(path.join(demo, 'locales'), { recursive: true });
  await fs.writeFile(
    path.join(demo, '.i18nrc.cjs'),
    `module.exports = {
  entry: 'locales/en_US.json',
  entryLocale: 'en_US',
  output: 'locales',
  outputLocales: ['zh_CN', 'ja_JP'],
};
`,
  );
  await fs.writeFile(
    path.join(demo, 'locales/en_US.json'),
    JSON.stringify(
      {
        buttons: { ok: 'Ok', cancel: 'Cancel' },
        welcome: 'Welcome to Lobe i18n',
        tip: 'Translate missing keys with AI',
      },
      null,
      2,
    ) + '\n',
  );
  await fs.writeFile(
    path.join(demo, 'locales/zh_CN.json'),
    '{\n  "buttons": {\n    "ok": "确定"\n  }\n}\n',
  );
  await fs.writeFile(path.join(demo, 'locales/ja_JP.json'), '{\n}\n');
}

async function captureI18nPreview() {
  const demo = path.join(tmpdir(), 'lobe-i18n-demo-preview');
  await prepareI18nDemo(demo);
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-i18n',
      args: [],
      cwd: demo,
      rows: 36,
      cols: 90,
      keys: [],
      readyBytes: ['2/2 done'],
      settle: 1.2,
      timeout: 180,
    }),
  );
  const markers = ['Success', 'LOBE', 'Lobe', 'translate', 'i18n', 'I18N', 'token'];
  if (!markers.some((m) => out.includes(Buffer.from(m)))) {
    const tail = out.toString('utf8', Math.max(0, out.length - 800));
    throw new Error(`lobe-i18n-preview: no i18n UI markers (${out.length} bytes). Tail:\n${tail}`);
  }
  const trimmed = pickBestI18nFrame(out);
  await writeFixture('lobe-i18n-preview', trimmed, ['zh_CN', 'ja_JP']);
  await fs.copyFile(
    path.join(fixturesDir, 'lobe-i18n-preview.ansi'),
    path.join(fixturesDir, 'preview-i18n.ansi'),
  );
  console.log('[capture] also wrote fixtures/preview-i18n.ansi');
}

async function captureLabelPreview() {
  const demo = path.join(tmpdir(), 'lobe-label-demo-preview');
  await fs.rm(demo, { recursive: true, force: true });
  await fs.mkdir(demo, { recursive: true });
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-label',
      args: ['-o'],
      cwd: demo,
      rows: 28,
      cols: 72,
      keys: [],
      readyBytes: ['GitHub'],
      settle: 0.9,
      timeout: 15,
    }),
  );
  await writeFixture('preview-label', out, ['GitHub']);
}

async function captureOption(name, cmd, readyBytes) {
  const demo = path.join(tmpdir(), `lobe-${name}-demo`);
  await fs.rm(demo, { recursive: true, force: true });
  await fs.mkdir(demo, { recursive: true });
  const out = await runPythonCapture(
    pyCapture({
      cmd,
      args: ['-o'],
      cwd: demo,
      rows: 28,
      cols: 72,
      keys: [],
      readyBytes,
      settle: 0.9,
      timeout: 15,
    }),
  );
  await writeFixture(name, out, readyBytes.slice(0, 1));
}

async function captureCommitOption() {
  await captureOption('preview-commit-option', 'lobe-commit', ['Settings', 'Provider']);
}

async function captureI18nOption() {
  await captureOption('preview-i18n-option', 'lobe-i18n', ['Settings', 'Provider']);
}

async function captureLabelOption() {
  await captureOption('preview-label-option', 'lobe-label', ['Settings', 'GitHub']);
}

async function captureSeoOption() {
  await captureOption('preview-seo-option', 'lobe-seo', ['Settings', 'Provider']);
}

async function prepareSeoDemo(demo) {
  await fs.rm(demo, { recursive: true, force: true });
  await fs.mkdir(path.join(demo, 'docs'), { recursive: true });
  await fs.writeFile(
    path.join(demo, '.seorc.js'),
    `module.exports = { entry: ['docs/**/*.mdx'], entryLocale: 'en_US', outputLocales: ['zh_CN'] };\n`,
  );
  await fs.writeFile(
    path.join(demo, 'docs/hello.mdx'),
    `---\ntitle: Hello\n---\n\n# Hello\n\nContent here.\n`,
  );
}

async function captureSeoPreview() {
  const demo = path.join(tmpdir(), 'lobe-seo-demo-preview');
  await prepareSeoDemo(demo);
  const out = await runPythonCapture(
    pyCapture({
      cmd: 'lobe-seo',
      args: [],
      cwd: demo,
      rows: 36,
      cols: 90,
      keys: [],
      readyBytes: ['All seo'],
      settle: 1.2,
      timeout: 180,
    }),
  );
  await writeFixture('preview-seo', out, ['hello.mdx']);
}

const ALL = {
  'commit-type': captureCommitType,
  'preview': captureCommitType,
  'preview-ai': capturePreviewAi,
  'preview-editor': capturePreviewEditor,
  'lobe-i18n-preview': captureI18nPreview,
  'preview-i18n': captureI18nPreview,
  'preview-label': captureLabelPreview,
  'preview-commit-option': captureCommitOption,
  'preview-i18n-option': captureI18nOption,
  'preview-label-option': captureLabelOption,
  'preview-seo-option': captureSeoOption,
  'preview-seo': captureSeoPreview,
};

async function main() {
  const wanted = process.argv.slice(2).filter((a) => a !== '--');
  const names =
    wanted.length > 0
      ? wanted
      : ['commit-type', 'preview-ai', 'preview-editor', 'lobe-i18n-preview', 'preview-label'];
  const done = new Set();
  for (const name of names) {
    const fn = ALL[name];
    if (!fn) {
      console.error(`[capture] unknown scene: ${name}`);
      process.exitCode = 1;
      continue;
    }
    if (done.has(fn)) continue;
    done.add(fn);
    console.log(`[capture] === ${name} ===`);
    try {
      await fn();
    } catch (err) {
      console.error(`[capture] FAIL ${name}:`, err?.message ?? err);
      process.exitCode = 1;
    }
  }
}

main();
