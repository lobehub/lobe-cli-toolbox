---
name: lobe-commit
description: Write git commit messages in the gitmoji + conventional commits format used by lobe-commit (`@lobehub/commit-cli`), and help set up the lobe-commit CLI, its git hook and AI provider. Use when committing in a repository that uses lobe-commit (e.g. `.lobecommitignore` exists, `lobe-commit` is in package.json, or history looks like `✨ feat(scope): ...`), or when the user asks about lobe-commit.
---

# lobe-commit

`lobe-commit` (npm `@lobehub/commit-cli`, binaries `lobe-commit` / `lobe`) is an interactive
CLI that writes gitmoji commit messages, optionally with AI.

## Writing commit messages

When you commit on the user's behalf, write the message yourself in the same format the CLI
produces, then run `git commit` as usual. Do not run `lobe-commit` / `lobe-commit --ai` for this:
they are interactive TUIs that wait for keyboard input.

Format:

```
<emoji> <type>(<scope>): <subject>

<optional body explaining what changed and why>
```

- Pick exactly one type:

  | Emoji | Type     | Use for                                                   |
  | ----- | -------- | --------------------------------------------------------- |
  | ✨    | feat     | Introduce new features                                    |
  | 🐛    | fix      | Fix a bug                                                 |
  | ♻️    | refactor | Refactor code that neither fixes a bug nor adds a feature |
  | ⚡    | perf     | A code change that improves performance                   |
  | 💄    | style    | Style files that do not affect the meaning of the code    |
  | ✅    | test     | Add missing tests or correct existing tests               |
  | 📝    | docs     | Documentation only changes                                |
  | 👷    | ci       | CI configuration files and scripts                        |
  | 🔧    | chore    | Other changes that do not modify src or test files        |
  | 📦    | build    | Architectural or build changes                            |

- `scope` is optional, lowercase, and names the affected module or package, e.g. `✨ feat(i18n): ...`.

- Subject: imperative present tense ("Add", not "Added"), no trailing period, no "This commit".

- Keep the header within 100 characters (the default `maxLength`) and body lines within 74.

- Follow the repository's existing history for language and scope naming when it differs.

Always pass the message with `git commit -m` / `-F`. If the lobe-commit `prepare-commit-msg` hook
is installed, it skips the wizard when a message is given. A hook from an older version (no
`[ -n "$2" ] && exit 0` line, check the hooks path from `git config core.hooksPath` or
`.git/hooks/prepare-commit-msg`) opens the wizard on `/dev/tty` and blocks; refresh it with
`lobe-commit -i` (it only rewrites that hook file).

## CLI commands

| Command                 | What it does                                                     | Interactive |
| ----------------------- | ---------------------------------------------------------------- | ----------- |
| `lobe-commit`           | Step-by-step commit wizard                                       | yes         |
| `lobe-commit -a`        | Generate the message with AI, then confirm / edit and commit     | yes         |
| `lobe-commit -o`        | Preferences: provider, model, emoji style, locale, max length... | yes         |
| `lobe-commit -i` / `-r` | Install / remove the `prepare-commit-msg` git hook               | no          |
| `lobe-commit -l`        | List supported commit types                                      | no          |
| `lobe-commit skill`     | Install this skill (`-g` for global, `--agent agents claude`)    | no          |

Interactive commands need a real terminal: ask the user to run them instead of running them
yourself.

## AI provider

AI mode needs a provider. The user configures it once with `lobe-commit -o` (provider → API
protocol → base URL → API key → model). For CI or one-off runs, environment variables override
the stored config:

| Variable        | Meaning                                                                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `LOBE_PROVIDER` | Preset: `openai` `anthropic` `google` `deepseek` `qwen` `moonshot` `zhipu` `minimax` `openrouter` `siliconflow` `volcengine` `groq` `xai` `mistral` `ollama` `lmstudio` `custom` |
| `LOBE_API_TYPE` | `chat-completions`, `responses`, `anthropic` or `gemini`                                                                                                                         |
| `LOBE_BASE_URL` | API base URL                                                                                                                                                                     |
| `LOBE_API_KEY`  | API key (presets also read their own, e.g. `DEEPSEEK_API_KEY`, `ANTHROPIC_API_KEY`)                                                                                              |

Legacy `OPENAI_API_KEY` / `OPENAI_PROXY_URL` still work when no provider is configured.
Configs written by older versions are migrated automatically the next time any command runs.

## Ignoring files

Add glob patterns to `.lobecommitignore` (gitignore syntax) to keep generated or noisy files
(lockfiles, snapshots, build output) out of the diff sent to the AI.
