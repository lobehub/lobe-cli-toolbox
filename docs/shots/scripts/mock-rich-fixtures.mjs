#!/usr/bin/env node
/**
 * Build rich docs/shots fixtures from real CLI ANSI structure (not unrelated fake CLIs).
 * - preview-i18n / preview-seo: TaskList lines matching createTaskList paint
 * - preview-editor: Lobe Commit wizard at Link issues (MultiSearchSelect-ready look)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.resolve(__dirname, '../fixtures');

const ESC = '\u001B';
const C = {
  green: `${ESC}[38;2;74;222;128m`,
  blue: `${ESC}[38;2;92;200;255m`,
  purple: `${ESC}[38;2;167;139;250m`,
  border: `${ESC}[38;2;75;75;75m`,
  reset: `${ESC}[39m`,
  dim: `${ESC}[2m`,
  undim: `${ESC}[22m`,
  bold: `${ESC}[1m`,
  unbold: `${ESC}[22m`,
  inv: `${ESC}[7m`,
  uninv: `${ESC}[27m`,
};

const syncOpen = `${ESC}[?2026h`;
const syncClose = `${ESC}[?2026l`;
const hideCursor = `${ESC}[?25l`;

function progressBar(pct, width = 20) {
  const complete = Math.round((Math.min(100, Math.max(0, pct)) / 100) * width);
  return (
    `${C.purple}${'━'.repeat(complete)}${C.reset}` +
    `${C.border}${'━'.repeat(width - complete)}${C.reset}`
  );
}

function padTag(tag, tagWidth) {
  return tag + ' '.repeat(Math.max(0, tagWidth - tag.length));
}

function doneLine(tag, title, detail, tagWidth) {
  return (
    `${C.green}✔${C.reset} ${C.blue}${padTag(tag, tagWidth)}${C.reset} ${title}  ` +
    `${C.dim}${detail}${C.undim}`
  );
}

function runningLine(tag, title, pct, detail, tagWidth, spinner = '⠹') {
  const pctText = `${Math.round(pct)}%`.padStart(4);
  return (
    `${C.purple}${spinner}${C.reset} ${C.blue}${padTag(tag, tagWidth)}${C.reset} ${title}  ` +
    `${progressBar(pct)} ${pctText} ${C.dim}${detail}${C.undim}`
  );
}

function taskFrame(lines, doneCount, total) {
  const body = [...lines, `${C.dim}  ${doneCount}/${total} done${C.undim}`].join('\n');
  // Match real captures: synchronized frame wrapper (no preamble; extractLastAnsiFrame keeps this)
  return `${syncOpen}${body}\n${syncClose}\n`;
}

async function writeI18n() {
  const tagWidth = 6; // max locale len 5 + 1
  const locales = [
    { kind: 'done', tag: 'zh_CN', title: 'locales/zh_CN.json', detail: '1,248 tokens' },
    { kind: 'done', tag: 'zh_TW', title: 'locales/zh_TW.json', detail: '1,192 tokens' },
    { kind: 'done', tag: 'ja_JP', title: 'locales/ja_JP.json', detail: '1,356 tokens' },
    { kind: 'done', tag: 'ko_KR', title: 'locales/ko_KR.json', detail: '1,087 tokens' },
    {
      kind: 'run',
      tag: 'fr_FR',
      title: 'locales/fr_FR.json',
      pct: 75,
      detail: '3/4 chunks · ~2,140 tokens',
      spinner: '⠼',
    },
    {
      kind: 'run',
      tag: 'de_DE',
      title: 'locales/de_DE.json',
      pct: 50,
      detail: '2/4 chunks · ~2,080 tokens',
      spinner: '⠹',
    },
    {
      kind: 'run',
      tag: 'es_ES',
      title: 'locales/es_ES.json',
      pct: 25,
      detail: '1/4 chunks · ~1,960 tokens',
      spinner: '⠋',
    },
    {
      kind: 'run',
      tag: 'pt_BR',
      title: 'locales/pt_BR.json',
      pct: 0,
      detail: '0/3 chunks · ~1,540 tokens',
      spinner: '⠇',
    },
  ];
  const lines = locales.map((item) => {
    if (item.kind === 'done') return doneLine(item.tag, item.title, item.detail, tagWidth);
    return runningLine(item.tag, item.title, item.pct, item.detail, tagWidth, item.spinner);
  });
  const buf = Buffer.from(taskFrame(lines, 4, 8), 'utf8');
  await fs.writeFile(path.join(fixturesDir, 'preview-i18n.ansi'), buf);
  await fs.writeFile(path.join(fixturesDir, 'lobe-i18n-preview.ansi'), buf);
  console.log(`[mock] preview-i18n.ansi (${buf.length} bytes) — 8 locales, 4 done / 4 running`);
}

async function writeSeo() {
  // SEO TaskList has no tag — title is the mdx path only
  const files = [
    { kind: 'done', title: 'docs/guide/introduction.mdx', detail: '1,024 tokens' },
    { kind: 'done', title: 'docs/guide/quick-start.mdx', detail: '896 tokens' },
    { kind: 'done', title: 'docs/guide/configuration.mdx', detail: '1,312 tokens' },
    { kind: 'done', title: 'docs/features/i18n.mdx', detail: '1,148 tokens' },
    {
      kind: 'run',
      title: 'docs/features/seo.mdx',
      pct: 80,
      detail: 'streaming…',
      spinner: '⠼',
    },
    {
      kind: 'run',
      title: 'docs/features/commit.mdx',
      pct: 45,
      detail: 'streaming…',
      spinner: '⠹',
    },
    {
      kind: 'run',
      title: 'docs/changelog/2026-11.mdx',
      pct: 15,
      detail: 'streaming…',
      spinner: '⠋',
    },
    { kind: 'warn', title: 'docs/drafts/wip-agent.mdx', detail: 'no SEO result' },
  ];

  const lines = files.map((item) => {
    if (item.kind === 'done') {
      return `${C.green}✔${C.reset} ${item.title}  ${C.dim}${item.detail}${C.undim}`;
    }
    if (item.kind === 'warn') {
      return `${ESC}[38;2;250;204;21m⚠${C.reset} ${item.title}  ${C.dim}${item.detail}${C.undim}`;
    }
    const pctText = `${Math.round(item.pct)}%`.padStart(4);
    // SEO runQuery does not pass progress today, but user asked for multi-progress richness;
    // keep TaskList running-line shape (spinner + title + bar) so the shot looks mid-flight.
    return (
      `${C.purple}${item.spinner}${C.reset} ${item.title}  ` +
      `${progressBar(item.pct)} ${pctText} ${C.dim}${item.detail}${C.undim}`
    );
  });
  const buf = Buffer.from(taskFrame(lines, 4, 8), 'utf8');
  await fs.writeFile(path.join(fixturesDir, 'preview-seo.ansi'), buf);
  console.log(`[mock] preview-seo.ansi (${buf.length} bytes) — 8 mdx, mixed done/run/warn`);
}

function editorFrame() {
  // Built from real lobe-commit Panel / StepSummary / MultiSearchSelect paint (same SGR as captures)
  const bar = `${C.border}│${C.reset}`;
  const lines = [
    `${C.border}┌  ${C.bold}${C.purple}🤯 Lobe Commit${C.reset}${C.unbold}`,
    bar,
    `${C.border}◇  ${C.reset}${C.dim}Type${C.undim}      ✨ feat`,
    bar,
    `${C.border}◇  ${C.reset}${C.dim}Scope${C.undim}     ui`,
    bar,
    `${C.border}◇  ${C.reset}${C.dim}Subject${C.undim}   improve commit wizard UX`,
    bar,
    `${C.purple}◆  ${C.reset}${C.bold}Link issues${C.unbold}${C.dim}  optional${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple}❯ ${C.reset}${C.inv} ${C.uninv}${C.dim}Search 12 open issues${C.undim}`,
    `${C.purple}│${C.reset}`,
    `${C.purple}│${C.reset}  ${C.purple}❯${C.reset} ${C.purple}◼${C.reset} ${C.bold}${C.purple}#128${C.reset}${C.unbold}   ${C.dim}Add commit wizard preview shots${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple} ${C.reset} ${C.dim}◻${C.undim} #142   ${C.dim}Fix i18n progress bar flicker${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple} ${C.reset} ${C.dim}◻${C.undim} #156   ${C.dim}Document lobe-seo concurrency${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple} ${C.reset} ${C.purple}◼${C.reset} #163   ${C.dim}Support nested locale namespaces${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple} ${C.reset} ${C.dim}◻${C.undim} #171   ${C.dim}Add SEO frontmatter validation${C.undim}`,
    `${C.purple}│${C.reset}  ${C.purple} ${C.reset} ${C.dim}◻${C.undim} #184   ${C.dim}Polish docs shots Grainient cards${C.undim}`,
    `${C.purple}│${C.reset}  ${C.dim}  ↓ 6 more${C.undim}`,
    `${C.purple}│${C.reset}`,
    `${C.purple}│${C.reset}  ${C.dim}preview${C.undim}  ✨ feat(ui): Improve commit wizard UX`,
    `${C.purple}└${C.reset}  type${C.dim} filter · ${C.undim}space${C.dim} toggle · ${C.undim}enter${C.dim} confirm · ${C.undim}esc${C.dim} back${C.undim}`,
  ];
  return `${syncOpen}${hideCursor}${lines.join('\n')}\n${syncClose}\n`;
}

async function writeEditor() {
  const buf = Buffer.from(editorFrame(), 'utf8');
  await fs.writeFile(path.join(fixturesDir, 'preview-editor.ansi'), buf);
  console.log(
    `[mock] preview-editor.ansi (${buf.length} bytes) — type/scope/subject + issues list`,
  );
}

async function main() {
  await fs.mkdir(fixturesDir, { recursive: true });
  await writeI18n();
  await writeSeo();
  await writeEditor();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
