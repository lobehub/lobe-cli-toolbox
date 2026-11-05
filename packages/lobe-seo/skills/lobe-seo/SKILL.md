---
name: lobe-seo
description: Generate SEO front matter (title, description, tags) for MDX / markdown docs with lobe-seo (`@lobehub/seo-cli`). Use when a project has `.seorc*` / a `seo` field in package.json / `@lobehub/seo-cli` installed, when new docs or blog posts need SEO metadata, or when the user asks about lobe-seo.
---

# lobe-seo

`lobe-seo` (npm `@lobehub/seo-cli`) reads MDX files, asks an LLM for an SEO `title`,
`description` and `tags`, and writes them into each file's front matter.

## Workflow

1. Write or update the docs. Files that already have `title`, `description` and `tags` in their
   front matter (or under `groupKey`) are skipped, so remove those fields to regenerate them.
2. Run `lobe-seo` (or the project's script; check package.json first).
3. Review the diff: the front matter is rewritten with gray-matter, so formatting of existing
   fields may change.

## Commands

```shell
lobe-seo                    # generate SEO front matter for files matching `entry`
lobe-seo -c ./seo.config.js # use a specific config file
lobe-seo skill              # install this skill (`-g` global, `--agent agents claude`)
lobe-seo -o                 # interactive provider / model setup, ask the user to run it
```

## Config file

Searched with cosmiconfig: `seo` in package.json, `.seorc`, `.seorc.json|yaml|yml|js|cjs`.
Use `defineConfig` from `@lobehub/seo-cli` for type checking in JS configs.

```js
const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: './docs/**/*.mdx',
  reference: 'Docs of an open-source AI chat framework', // optional guidance
  groupKey: 'seo', // optional: write fields under `seo:` instead of the top level
});
```

| Option                  | Default   | Notes                                       |
| ----------------------- | --------- | ------------------------------------------- |
| `entry`                 | required  | File, folder or glob                        |
| `entryExtension`        | `.mdx`    |                                             |
| `groupKey`              | -         | Nest the generated fields under this key    |
| `tagStringify`          | `false`   | Write `tags` as a comma separated string    |
| `modelName`             | from `-o` | Overrides the model chosen in `lobe-seo -o` |
| `reference`             | -         | Extra rules or context for the model        |
| `concurrency`           | `5`       |                                             |
| `temperature`           | `0`       |                                             |
| `experimental.jsonMode` | `false`   | Ask the model for JSON output               |

## AI provider

The provider is configured once per machine with `lobe-seo -o` (provider → API protocol → base
URL → API key → model). If a run fails with "Please choose a model" or "Please set the ... API
key", ask the user to run `lobe-seo -o`, or set environment variables (useful in CI):

| Variable        | Meaning                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOBE_PROVIDER` | Preset: `openai` `anthropic` `google` `deepseek` `qwen` `moonshot` `zhipu` `minimax` `openrouter` `siliconflow` `volcengine` `groq` `xai` `mistral` `ollama` `lmstudio` `custom` |
| `LOBE_API_TYPE` | `chat-completions`, `responses`, `anthropic` or `gemini`                                                                                                                         |
| `LOBE_BASE_URL` | API base URL                                                                                                                                                                     |
| `LOBE_API_KEY`  | API key (presets also read their own, e.g. `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`)                                                                                              |

Legacy `OPENAI_API_KEY` / `OPENAI_PROXY_URL` still work when no provider is configured.
Configs written by older versions are migrated automatically the next time any command runs.
Never write API keys into the config file or the repository.
