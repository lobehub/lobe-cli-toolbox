<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/love-letter.webp">

<h1>Lobe Commit</h1>

Lobe Commit is a CLI tool that uses ChatGPT to generate Gitmoji-based commit messages

English · [简体中文](./README.zh-CN.md) · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

[![][npm-release-shield]][npm-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![](https://gw.alipayobjects.com/zos/kitchen/3%26ByxtP39X/preview.webp)

</div>

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
- [🤝 Contributing](#-contributing)
- [🔗 Links](#-links)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ Features

- [x] 🤯 Supports auto-generating commit messages based on diffs using ChatGPT
- [x] 🛠️ Supports streamlined commit message editing workflow
- [x] 😜 Supports adding Gitmojis
- [x] 📝 Supports Conventional Commits specification
- [x] ⚡️ Supports pulling a list of issues and convenient binding
- [x] 💄 Supports custom prompts
- [x] 🗺️ Supports multi-language commit messages

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe Commit, run the following command:

```bash
npm install -g @lobehub/commit-cli
```

> \[!IMPORTANT]\
> Please make sure you have `Node.js` version **>= 18**

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

You can use the `lobe-commit` command to generate a commit message for your staged changes:

```shell
$ git add <files...>
$ lobe-commit
```

> \[!NOTE]\
> Use the `lobe` alias if `lobe-commit` is too long for you.

<br/>

#### AI mode

With AI mode, you can generate a complete commit message using ChatGPT.

> \[!IMPORTANT]\
> To use AI auto-generation, you need to fill in your OpenAI token in the settings by `lobe-commit -o`. and if you have special network requirements, you can add OpenAI's forwarding address in the settings.

![](https://gw.alipayobjects.com/zos/kitchen/qmXcNvnjKf/preview-ai.webp)

<br/>

#### Editor mode

In Editor mode, you can choose the `<type>(<optional scope>): <subject> [<issues>]` format by following a simple flow.

> \[!NOTE]\
> If your project is a GitHub repository, the Editor mode feature will automatically fetch the issues associated with your repository. You can select multiple issues to link to your commit message by <kbd>space</kbd> .

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
$ lobe-commit --option # or use short flag -o
```

### Running

To make a commit, run one of the following commands:

```shell
$ lobe-commit --hook # Run either of the two commands
$ git commit
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

- To use AI auto-generation, you need to fill in your [OpenAI token](<(https://platform.openai.com/account/api-keys)>) in the settings.
- To automatically pull private issues, you need to fill in your [GitHub token](https://github.com/settings/tokens) with repo permissions in the settings.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Options

Lobe Commit supports the following options:

```shell
--hook         Commit interactively using prompts
-a, --ai       Generate prompts by ChatGPT
-o, --option   Setup lobe-commit preferences
-i, --init     Initialize lobe-commit as a commit hook
-r, --remove   Remove a previously initialized commit hook
-l, --list     List all commit types supported
-V, --version  Print lobe-commit installed version 
-h, --help     Print basic options
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Or clone it for local development:

[![][bun-shield]][bun-link]

```bash
$ git clone https://github.com/lobehub/lobe-cli-toolbox.git
$ cd lobe-cli-toolbox
$ bun install
$ cd packages/lobe-commit
$ bun dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

Contributions of all types are more than welcome, if you are interested in contributing code, feel free to check out our GitHub [Issues][github-issues-link] to get stuck in to show us what you’re made of.

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Links

### More Products

- **[🤖 Lobe Chat][lobe-chat]** - An open-source, extensible (Function Calling), high-performance chatbot framework. It supports one-click free deployment of your private ChatGPT/LLM web application.
- **[🤯 Lobe Theme][lobe-theme]** - The modern theme for stable diffusion webui, exquisite interface design, highly customizable UI, and efficiency boosting features.

### Credits

- **langchainjs** - <https://github.com/hwchase17/langchainjs>
- **ink** - <https://github.com/vadimdemedes/ink>
- **gitmoji-commit-workflow** - <https://github.com/arvinxx/gitmoji-commit-workflow>
- **gitmoji-cli** - <https://github.com/carloscuesta/gitmoji-cli>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [LobeHub][profile-link]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
[bun-link]: https://bun.sh
[bun-shield]: https://img.shields.io/badge/-speedup%20with%20bun-black?logo=bun&style=for-the-badge
[github-action-release-link]: https://github.com/lobehub/lobe-cli-toolbox/actions/workflows/release.yml
[github-action-release-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-cli-toolbox/release.yml?label=release&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-action-test-link]: https://github.com/lobehub/lobe-cli-toolbox/actions/workflows/test.yml
[github-action-test-shield]: https://img.shields.io/github/actions/workflow/status/lobehub/lobe-cli-toolbox/test.yml?label=test&labelColor=black&logo=githubactions&logoColor=white&style=flat-square
[github-codespace-link]: https://codespaces.new/lobehub/lobe-cli-toolbox
[github-codespace-shield]: https://github.com/codespaces/badge.svg
[github-contrib-link]: https://github.com/lobehub/lobe-cli-toolbox/graphs/contributors
[github-contrib-shield]: https://contrib.rocks/image?repo=lobehub%2Flobe-cli-toolbox
[github-contributors-link]: https://github.com/lobehub/lobe-cli-toolbox/graphs/contributors
[github-contributors-shield]: https://img.shields.io/github/contributors/lobehub/lobe-cli-toolbox?color=c4f042&labelColor=black&style=flat-square
[github-forks-link]: https://github.com/lobehub/lobe-cli-toolbox/network/members
[github-forks-shield]: https://img.shields.io/github/forks/lobehub/lobe-cli-toolbox?color=8ae8ff&labelColor=black&style=flat-square
[github-issues-link]: https://github.com/lobehub/lobe-cli-toolbox/issues
[github-issues-shield]: https://img.shields.io/github/issues/lobehub/lobe-cli-toolbox?color=ff80eb&labelColor=black&style=flat-square
[github-license-link]: https://github.com/lobehub/lobe-cli-toolbox/blob/master/LICENSE
[github-license-shield]: https://img.shields.io/github/license/lobehub/lobe-cli-toolbox?color=white&labelColor=black&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobe-cli-toolbox/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobe-cli-toolbox?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobe-cli-toolbox/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobe-cli-toolbox?color=ffcb47&labelColor=black&style=flat-square
[issues-url]: https://github.com/canisminor1990/lobe-commit/issues/new/choose
[lobe-chat]: https://github.com/lobehub/lobe-chat
[lobe-theme]: https://github.com/lobehub/sd-webui-lobe-theme
[npm-release-link]: https://www.npmjs.com/package/@lobehub/commit-cli
[npm-release-shield]: https://img.shields.io/npm/v/@lobehub/commit-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-cli-toolbox/pulls
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
