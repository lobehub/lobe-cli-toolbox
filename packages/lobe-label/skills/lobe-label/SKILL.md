---
name: lobe-label
description: Copy GitHub issue labels from a template repository to another repository with lobe-label (`@lobehub/label-cli`). Use when the user wants to sync, copy or reset GitHub issue labels across repositories, or asks about lobe-label.
---

# lobe-label

`lobe-label` (npm `@lobehub/label-cli`) replaces the issue labels of a GitHub repository with the
labels of a source repository.

## Before running

`lobe-label -t` first **deletes every label in the target repository**, then creates the source
labels (name, color, description). Issues and PRs lose labels that do not exist in the source.
Always confirm the target repository with the user before running it.

## Commands

```shell
lobe-label -t owner/repo                   # copy from canisminor1990/canisminor-template
lobe-label -t owner/repo -s owner/template # copy from another source repo
lobe-label skill                           # install this skill (`-g` global, `--agent agents claude`)
lobe-label -o                              # interactive: store a GitHub token, ask the user to run it
```

## GitHub token

Needs a token that can manage labels on the target repository (classic `repo` scope, or a
fine-grained token with Issues read/write). It is read from `lobe-label -o`, then `GITHUB_TOKEN`,
then `GH_TOKEN`. With the GitHub CLI logged in, `GITHUB_TOKEN=$(gh auth token) lobe-label -t ...`
works without storing a token. Never write the token into files in the repository.
