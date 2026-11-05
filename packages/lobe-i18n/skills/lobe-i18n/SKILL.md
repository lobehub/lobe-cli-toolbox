---
name: lobe-i18n
description: Translate i18n locale JSON files and markdown docs with lobe-i18n (`@lobehub/i18n-cli`), and lint translations. Use when a project has `.i18nrc*` / an `i18n` field in package.json / `@lobehub/i18n-cli` installed, when adding or changing UI strings that need translating, when translating README or docs into other languages, or when the user asks about lobe-i18n.
---

# lobe-i18n

`lobe-i18n` (npm `@lobehub/i18n-cli`) translates locale JSON files and markdown with an LLM.
It only translates what is missing or outdated, so it is safe to re-run.

## Workflow for UI strings

1. Edit only the entry locale (the `entry` file or folder, in `entryLocale`). Do not hand-write
   other languages.
2. Run `lobe-i18n` (or the project's script, e.g. `npm run i18n`; check package.json first).
   Keys missing from each output locale are translated, keys removed from the entry are removed,
   existing translations are kept.
3. To re-translate a changed string, delete that key from the output locales and run again.
4. Optionally run `lobe-i18n lint` to check that translated values are in the right language.

## Commands

All commands below are non-interactive except `-o`.

```shell
lobe-i18n                        # translate locale JSON (same as `lobe-i18n locale`)
lobe-i18n md                     # translate markdown
lobe-i18n md --force             # ignore the markdown cache, retranslate everything
lobe-i18n --with-md              # locale JSON, then markdown
lobe-i18n lint [--quiet]         # lint translation files for language correctness
lobe-i18n -c ./path/to/config.js # use a specific config file
lobe-i18n skill                  # install this skill (`-g` global, `--agent agents claude`)
lobe-i18n -o                     # interactive provider / model setup, ask the user to run it
```

## Config file

Searched with cosmiconfig: `i18n` in package.json, `.i18nrc`, `.i18nrc.json|yaml|yml|js|cjs`.
Use `defineConfig` from `@lobehub/i18n-cli` for type checking in JS configs.

```js
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'locales/en-US', // a JSON file (flat: one file per locale) or a folder (tree)
  entryLocale: 'en-US',
  output: 'locales',
  outputLocales: ['zh-CN', 'ja-JP'],
  reference: 'Product UI of a note-taking app, keep it short', // optional context
  markdown: {
    entry: ['README.md', 'docs/**/*.md'],
    exclude: ['CHANGELOG.md'],
    outputLocales: ['zh-CN'],
    // outputExtensions: (locale) => `.${locale}.md`, // default
  },
});
```

| Option                  | Default   | Notes                                                                     |
| ----------------------- | --------- | ------------------------------------------------------------------------- |
| `modelName`             | from `-o` | Overrides the model chosen in `lobe-i18n -o`                              |
| `keyStyle`              | `nested`  | `nested`, `flat` or `auto` (preserve the entry's dotted keys)             |
| `splitToken`            | `4000`    | Tokens per chunk; larger chunks can exceed the model's max output tokens  |
| `concurrency`           | `5`       | Max parallel LLM requests, shared across all files and locales            |
| `glossary`              | -         | Fixed term translations: `{ Brand: 'Brand', agent: { 'zh-CN': '助手' } }` |
| `referenceExamples`     | `20`      | Existing translations sent per chunk for consistent terms, `0` disables   |
| `temperature`           | `0`       |                                                                           |
| `saveImmediately`       | `true`    | Write after each chunk so interrupted runs keep progress                  |
| `experimental.jsonMode` | `false`   | Ask the model for JSON output                                             |

Markdown options: `entryExtension` (`.md`), `mode` (`string` / `mdast` / function),
`translateCode`, `includeMatter`, `cacheFile` (`.i18n-cache.json`, records source hashes so only
changed docs are retranslated; commit it).

## AI provider

The provider is configured once per machine with `lobe-i18n -o` (provider → API protocol → base
URL → API key → model). If a run fails with "Please choose a model" or "Please set the ... API
key", ask the user to run `lobe-i18n -o`, or set environment variables (useful in CI):

| Variable        | Meaning                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOBE_PROVIDER` | Preset: `openai` `anthropic` `google` `deepseek` `qwen` `moonshot` `zhipu` `minimax` `openrouter` `siliconflow` `volcengine` `groq` `xai` `mistral` `ollama` `lmstudio` `custom` |
| `LOBE_API_TYPE` | `chat-completions`, `responses`, `anthropic` or `gemini`                                                                                                                         |
| `LOBE_BASE_URL` | API base URL                                                                                                                                                                     |
| `LOBE_API_KEY`  | API key (presets also read their own, e.g. `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`)                                                                                              |

Legacy `OPENAI_API_KEY` / `OPENAI_PROXY_URL` still work when no provider is configured.
Configs written by older versions are migrated automatically the next time any command runs.
Never write API keys into the config file or the repository.
