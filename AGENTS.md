# AGENTS.md

Guidance for AI coding agents working in this repository. Everything below was checked against the code; if you find a mismatch, trust the code and fix this file.

## Overview

Lobe CLI Toolbox is a pnpm monorepo of AI-powered command line tools built with [Ink](https://github.com/vadimdemedes/ink) (React for the terminal). Development needs Node.js `>=22.18.0` (root `engines`) and the pnpm version pinned in `packageManager` (`corepack enable` picks it up).

| Path                   | Package               | Published | What it is                                                                               |
| ---------------------- | --------------------- | --------- | ---------------------------------------------------------------------------------------- |
| `packages/lobe-commit` | `@lobehub/commit-cli` | yes       | `lobe-commit` / `lobe`: gitmoji commit messages from the staged diff, git hook           |
| `packages/lobe-i18n`   | `@lobehub/i18n-cli`   | yes       | `lobe-i18n`: translate locale JSON and markdown; also exports `defineConfig`             |
| `packages/lobe-seo`    | `@lobehub/seo-cli`    | yes       | `lobe-seo`: generate SEO frontmatter for MDX; also exports `defineConfig`                |
| `packages/lobe-label`  | `@lobehub/label-cli`  | yes       | `lobe-label`: sync GitHub issue labels from a template repo                              |
| `packages/lobe-cli-ui` | `@lobehub/cli-ui`     | yes       | Shared Ink components (`Panel`, `SelectInput`, `ConfigPanel`, `alert`, …); pack → `lib/` |
| `packages/common`      | `@lobehub/cli-common` | no        | Shared logic: LLM providers, prompt templates, text splitter, agent skills               |

Each CLI follows the same layout: `src/cli.tsx` (commander entry), `src/commands/` (Ink screens per command), `src/core/` (the actual work), `src/store/` (`conf` user config + selectors + migrations), `src/prompts/`, `src/utils/`, `src/types/`. `packages/*/skills/<name>/SKILL.md` are **product** skills shipped to users via `<cli> skill`; they are not instructions for working on this repo.

## Commands

Run from the repo root:

| Command                   | What it does                                                                    |
| ------------------------- | ------------------------------------------------------------------------------- |
| `pnpm install`            | Install. There is no lockfile (`lockfile: false`); versions resolve to highest  |
| `pnpm run ci`             | `lint` + `type-check` + `test`; must pass before committing                     |
| `pnpm run lint:fix`       | ESLint (flat config from `@lobehub/lint`) with autofix, incl. import sorting    |
| `pnpm run type-check`     | `tsc --noEmit` in every package; `tsc` is TypeScript 7 (the Go compiler)        |
| `pnpm test`               | Vitest across all packages (`vitest.config.ts` → `projects: ['packages/*']`)    |
| `pnpm run build`          | `tsdown` in every published package → `dist/` (cli-ui → `lib/`)                 |
| `pnpm run smoke`          | Runs every built CLI (`--version`, `--help`, entry imports) in a temporary HOME |
| `pnpm --filter <pkg> dev` | `tsdown --watch` for one package, e.g. `pnpm --filter @lobehub/i18n-cli dev`    |

Single package: `pnpm --filter @lobehub/commit-cli test`, or `pnpm vitest run --project lobe-commit`. Try a CLI locally with `pnpm --filter <pkg> build && node packages/<dir>/dist/cli.js --help`.

## How the packages fit together

- **Bundling.** `@lobehub/cli-common` stays private/source-only (`exports` → `src/*.ts`). `@lobehub/cli-ui` is publishable: workspace `exports` still point at `src/index.ts` so CLIs type-check and tsdown-bundle it; `clean-package` rewrites exports to `lib/` on pack. Each CLI lists both as `workspace:*` **devDependencies**; tsdown bundles those and keeps `dependencies` external. `clean-package` strips `devDependencies` (and `scripts`) on `npm pack`, so `workspace:*` never reaches npm. cli-ui library build: `pnpm --filter @lobehub/cli-ui build` → `packages/lobe-cli-ui/lib/` (docs site keeps using `dist/`).
- **Third-party imports of shared code are runtime deps of the CLI.** If `cli-ui` or `common` imports a package, every CLI that bundles that code must list it in its own `dependencies`. `pnpm run smoke` fails with `ERR_MODULE_NOT_FOUND` when one is missing. See `.agents/skills/managing-dependencies`.
- **Imports.** Inside a CLI, `@/…` maps to that package's `src/` (tsconfig `paths`, picked up by Vitest via `resolve.tsconfigPaths`). `cli-ui` and `common` must use **relative** imports, because their source is type-checked and bundled from inside other packages. Shared code is imported by subpath: `@lobehub/cli-common/llm`, `/providers`, `/promptTemplate`, `/textSplitter`, `/summarize`, `/skill`, `/skillCommand`, `/configMigration`, `/env`, `/ProviderSetup`.
- **LLM access** goes through `LLMClient` in `common/src/llm.ts` (Vercel AI SDK). Provider settings resolve in `common/src/providers.ts`: env vars `LOBE_PROVIDER`, `LOBE_API_TYPE`, `LOBE_BASE_URL`, `LOBE_API_KEY` override the stored config. `.env` in the working directory is loaded with `loadEnv()` (`process.loadEnvFile`, never overrides existing variables).
- **User config** is stored with `conf` (`projectName` = CLI name). Schema changes need a new numbered step in the `migrateConfigStore(config.store, { 2: …, 3: … })` call in the package's `src/store/config.ts` (`confStore.ts` in lobe-label); the runner lives in `common/src/configMigration.ts`. Project config for `lobe-i18n` / `lobe-seo` is found by cosmiconfig (`.i18nrc*`, `.seorc*`).
- **Fatal errors** use `alert.error(message, true)` from `@lobehub/cli-ui`; with `true` it exits with code 1 and is typed `never`, so `return alert.error(…, true)` works in any function. Non-fatal failures should set `process.exitCode = 1`.

## Code conventions

- TypeScript is strict, plus `noUncheckedIndexedAccess`, `noPropertyAccessFromIndexSignature` (use `process.env['X']`) and `verbatimModuleSyntax` (type-only imports need `import type`). Base config: root `tsconfig.json`. Do not add `baseUrl` or non-relative `paths`; TypeScript 7 rejects them.
- ESLint autofix sorts imports and object keys; run `pnpm run lint:fix` rather than ordering by hand. Rules disabled repo-wide are in `eslint.config.mjs` with the reason.
- Put logic in pure functions under `src/utils/` (or `common/src/`) and test them next to the source as `*.test.ts`. Ink components are tested with `ink-testing-library`.
- Shell out with `execFileSync('git', [...args])` from `node:child_process`, not a shell string.
- Do not change `packages/*/CHANGELOG.md`; release tooling writes them.

## Docs screenshots

CLI terminal diagrams for local docs / README come from `docs/shots` (Vite + Lobe UI + Grainient + Fluent Emoji). When you need a new shot or to refresh one, follow `.agents/skills/docs-shots`: prepare an `.ansi` fixture, then from `docs/shots` run `pnpm shot` / `pnpm shot -- path/to.ansi` (SnapDOM → `[data-shot]` → WebP @ 1920w; fallback `SHOT_ENGINE=playwright`). Preview with `pnpm dev` at `http://127.0.0.1:5179/`. Outputs land in `docs/shots/out/*.webp`; do not wire images into README unless asked.

## Commits and releases

- Commit messages are gitmoji + Conventional Commits, enforced by commitlint in `.husky/commit-msg`: `✨ feat(i18n): add glossary support`, `🐛 fix(commit): …`, `♻️ refactor: …`, `👷 ci: …`. `pre-commit` runs `type-check` and `lint-staged`.
- Releases run on `master` via `.github/workflows/release.yml` with `multi-semantic-release` (`pnpm run release`). The commit type decides the bump per package: `feat` → minor; `fix`, `perf`, `refactor`, `style`, `build` → patch; `docs`, `test`, `ci`, `chore` → no release. Config: `.releaserc.cjs` (from `@lobehub/lint/release`); private packages are skipped.
- `multi-semantic-release` publishes with npm, which does not rewrite `workspace:` protocols. That is why only devDependencies may use `workspace:*`, and why the root `package.json` must not declare `workspaces`: with it, `npm version` in a package loads the whole workspace and fails with `EUNSUPPORTEDPROTOCOL`. msr reads `pnpm-workspace.yaml` instead.
