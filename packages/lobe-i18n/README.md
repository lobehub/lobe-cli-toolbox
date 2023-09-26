<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/globe-showing-asia-australia.webp">

<h1>Lobe i18n</h1>

Lobe i18n is a tool that automates the i18n (internationalization) translation process using ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.

English · [简体中文](./README-zh_CN.md) · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

<!-- SHIELD GROUP -->

[![][npm-release-shield]][npm-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![](https://gw.alipayobjects.com/zos/kitchen/AH7rvv06qn/preview-i18n.webp)

</div>

<details>
<summary><kbd>Table of contents</kbd></summary>

#### TOC

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🤯 Usage](#-usage)
  - [Configuration](#configuration)
  - [Structure Selection](#structure-selection)
  - [Running](#running)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🔗 Links](#-links)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ Features

- [x] 🤖 Automated i18n translation using ChatGPT
- [x] ✂️ Support for automatic splitting of large files to avoid ChatGPT token limitations
- [x] ♻️ Incremental updates for i18n, extracting new content based on entry files
- [x] 🗂️ Support for single file mode (`en.json`) and folder mode (`en/common.json`), compatible with `i18next`
- [x] 🌲 Support for both `flat` and `tree` locale files
- [x] 🛠️ Customization options for OpenAI model, API proxy, and temperature

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe i8n, run the following command:

```bash
npm install -g @lobehub/i18n-cli
```

> **Note**\
> Make sure you have Node.js version >= 18\*

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

To initialize the Lobe i8n configuration, run the following command:

```shell
$ lobe-i18n --config # or use the short flag -o
```

> **Important**\
> To use AI auto-generation, fill in the [OpenAI token](https://platform.openai.com/account/api-keys) in the settings

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Configuration

The configuration can be specified in any of the following formats, using [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig):

- `i18n` property in `package.json`
- `.i18nrc` file in JSON or YAML format
- `.i18nrc.json`, `.i18nrc.yaml`, `.i18nrc.yml`, `.i18nrc.js`, `.i18nrc.mjs`, or `.i18nrc.cjs` file
- `i18nrc`, `i18nrc.json`, `i18nrc.yaml`, `i18nrc.yml`, `i18nrc.js`, or `i18nrc.cjs` file in the `.config` subdirectory
- `i18n.config.js`, `i18n.config.mjs`, or `i18n.config.cjs` file

| Property Name | Type      | Default Value     | Description                                   |
| ------------- | --------- | ----------------- | --------------------------------------------- |
| entry         | string    | -                 | Entry file or folder                          |
| entryLocale   | string    | -                 | Language to use as translation reference      |
| modelName     | string    | `'gpt-3.5-turbo'` | Model to use                                  |
| output        | string    | -                 | Location to store localized files             |
| outputLocales | string\[] | -                 | All the languages to be translated            |
| reference     | string    | -                 | Provide context for more accurate translation |
| splitToken    | number    | `2000`            | Split the localized JSON file by tokens       |
| temperature   | number    | `0`               | Sampling temperature to use                   |

**Example 1: `.i18nrc.js`**

```js
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'locales/en.json',
  entryLocale: 'en',
  output: 'locales',
  outputLocales: ['zh_CN', 'jp'],
});
```

**Example 2: `.i18nrc.json`**

```json
{
  "entry": "locales/en.json",
  "entryLocale": "en",
  "output": "locales",
  "outputLocales": ["zh_CN", "jp"]
}
```

**Example 3: `package.json`**

```json
{
  "...": "...",
  "i18n": {
    "entry": "locales/en.json",
    "entryLocale": "en",
    "output": "locales",
    "outputLocales": ["zh_CN", "jp"]
  }
}
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Structure Selection

**Single file structure**

```
- locales
	- en.json
	- jp.json
	- zh_CN.json
	- ...
```

Specify the corresponding JSON file as the `entry` in the configuration file [example](./examples/flat/.i18nrc.cjs)

```json
{
  "entry": "locales/en.json",
  "entryLocale": "en",
  "output": "locales",
  "outputLocales": ["zh_CN", "jp"]
}
```

**Folder structure**

```
- locales
	- en
		- common.json
		- header.json
		- ...
	- jp
		- common.json
		- header.json
		- ...
	- zh_CN
		- common.json
		- header.json
		- ...
```

Specify the corresponding folder as the `entry` in the configuration file [example](./examples/tree/.i18nrc.cjs)

```json
{
  "entry": "locales/en",
  "entryLocale": "en",
  "output": "locales",
  "outputLocales": ["zh_CN", "jp"]
}
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Running

Use the `lobe-i18n` command to automate the generation of i18n files:

```shell
$ lobe-i18n
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
$ cd packages/lobe-i18n
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
- **transmart** - <https://github.com/Quilljou/transmart>

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
[npm-release-link]: https://www.npmjs.com/package/@lobehub/i18n-cli
[npm-release-shield]: https://img.shields.io/npm/v/@lobehub/i18n-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-cli-toolbox/pulls
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
