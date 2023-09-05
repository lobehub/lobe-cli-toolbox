<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-logo/1.0.0/files/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/love-letter.webp">

<h1 align="center">Lobe Commit</h1>

Lobe Commit is a CLI tool that uses ChatGPT to generate Gitmoji-based commit messages

English · [简体中文](./README-zh_CN.md) · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

<!-- SHIELD GROUP -->

[![release][release-shield]][release-url]
![][release-download-shield]
[![releaseDate][release-date-shield]][release-date-url]
[![ciTest][ci-test-shield]][ci-test-url]
[![ciRelease][ci-release-shield]][ci-release-url]<br/>
[![contributors][contributors-shield]][contributors-url]
[![forks][forks-shield]][forks-url]
[![stargazers][stargazers-shield]][stargazers-url]
[![issues][issues-shield]][issues-url]

</div>

![](https://gw.alipayobjects.com/zos/kitchen/3%26ByxtP39X/preview.webp)

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [✨ Features](#-features)

- [📦 Installation](#-installation)

- [🤯 Usage](#-usage)

  - [Git hook](#git-hook)
  - [Configuration](#configuration)
  - [Options](#options)

- [⌨️ Local Development](#️-local-development)

- [🔗 Credits](#-credits)

####

</details>

## ✨ Features

- 🤯 Supports auto-generating commit messages based on diffs using ChatGPT
- 🛠️ Supports streamlined commit message editing workflow
- 😜 Supports adding Gitmojis
- 📝 Supports Conventional Commits specification
- ⚡️ Supports pulling a list of issues and convenient binding
- 💄 Supports custom prompts
- 🗺️ Supports multi-language commit messages

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe Commit, run the following command:

```bash
npm install -g @lobehub/commit-cli
```

> 👉 Tip: Make sure your node version >= 18

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

You can use the `lobe-commit` command to generate a commit message for your staged changes:

```shell
$ git add <files...>
$ lobe-commit
```

> 👉 Tip: Use the `lobe` alias if `lobe-commit` is too long for you.

<br/>

#### AI mode

With AI mode, you can generate a complete commit message using ChatGPT.

> 👉 Tip: To use AI auto-generation, you need to fill in your OpenAI token in the settings by `lobe-commit -o`. and if you have special network requirements, you can add OpenAI's forwarding address in the settings.

![](https://gw.alipayobjects.com/zos/kitchen/qmXcNvnjKf/preview-ai.webp)

<br/>

#### Editor mode

In Editor mode, you can choose the `<type>(<optional scope>): <subject> [<issues>]` format by following a simple flow.

> 👉 Tip: If your project is a GitHub repository, the Editor mode feature will automatically fetch the issues associated with your repository. You can select multiple issues to link to your commit message by <kbd>space</kbd> .

![](https://gw.alipayobjects.com/zos/kitchen/QkJ5V8nbY6/preview-editor.webp)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Git hook

You can integrate Lobe Commit with Git via the `prepare-commit-msg` hook. This allows you to use Git as you normally would and edit the commit message before committing.

<br/>

#### Install

To install the hook in the Git repository, run the following command:

```shell
$ lobe-commit --init # or use short flag -i
```

<br/>

#### Uninstall

To uninstall the hook from the Git repository, run the following command:

```shell
$ lobe-commit --remove # or use short flag -r
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Configuration

To configure Lobe Commit, run the following command:

```shell
$ lobe-commit --config # or use short flag -o
```

- To use AI auto-generation, you need to fill in your [OpenAI token](<(https://platform.openai.com/account/api-keys)>) in the settings.
- To automatically pull private issues, you need to fill in your [GitHub token](https://github.com/settings/tokens) with repo permissions in the settings.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Options

Lobe Commit supports the following options:

```shell
--commit -c Interactively commit using the prompts
--config -o Setup lobe-commit preferences
--help -h Print basic options
--init -i Initialize lobe-commit as a commit hook
--remove -r Remove a previously initialized commit hook
--list -l List all the available commit type
--version -v Print lobe-commit installed version
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Gitpod for online development:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-url]

Alternatively, you can clone the repository and run the following commands for local development:

```bash
$ git clone https://github.com/canisminor1990/lobe-commit.git
$ cd lobe-commit/packages/lobe-commit
$ npm install
$ npm start
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Credits

- langchainjs: <https://github.com/hwchase17/langchainjs>
- gitmoji-commit-workflow: <https://github.com/arvinxx/gitmoji-commit-workflow>
- gitmoji-cli: <https://github.com/carloscuesta/gitmoji-cli>
- ink: <https://github.com/vadimdemedes/ink>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [CanisMinor][profile-url]. <br /> This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[ci-release-shield]: https://github.com/lobehub/lobe-commit/actions/workflows/release.yml/badge.svg
[ci-release-url]: https://github.com/lobehub/lobe-commit/actions/workflows/release.yml
[ci-test-shield]: https://github.com/canisminor1990/lobe-commit/workflows/Test%20CI/badge.svg
[ci-test-url]: https://github.com/canisminor1990/lobe-commit/actions/workflows/test.yml
[contributors-shield]: https://img.shields.io/github/contributors/canisminor1990/lobe-commit.svg?style=flat
[contributors-url]: https://github.com/canisminor1990/lobe-commit/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/canisminor1990/lobe-commit.svg?style=flat
[forks-url]: https://github.com/canisminor1990/lobe-commit/network/members
[gitpod-url]: https://gitpod.io/#https://github.com/canisminor1990/lobe-commit
[issues-shield]: https://img.shields.io/github/issues/canisminor1990/lobe-commit.svg?style=flat
[issues-url]: https://github.com/canisminor1990/lobe-commit/issues/new/choose
[profile-url]: https://github.com/canisminor1990
[release-date-shield]: https://img.shields.io/github/release-date/canisminor1990/lobe-commit?style=flat
[release-date-url]: https://github.com/canisminor1990/lobe-commit/releases
[release-download-shield]: https://img.shields.io/npm/dt/@lobehub/commit-cli
[release-shield]: https://img.shields.io/npm/v/@lobehub/commit-cli?label=%F0%9F%A4%AF%20NPM
[release-url]: https://www.npmjs.com/package/@lobehub/commit-cli
[stargazers-shield]: https://img.shields.io/github/stars/canisminor1990/lobe-commit.svg?style=flat
[stargazers-url]: https://github.com/canisminor1990/lobe-commit/stargazers
