<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://npm.elemecdn.com/@lobehub/assets-logo@1.0.0/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://npm.elemecdn.com/fluentui-emoji/icons/modern/globe-showing-asia-australia.svg">

<h1 align="center">Lobe iI8n</h1>

Lobe i18n is a tool that automates the i18n (internationalization) translation process using ChatGPT. It supports features such as automatic splitting of large files, incremental updates, and customization options for the OpenAI model, API proxy, and temperature.

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

![](https://gw.alipayobjects.com/zos/kitchen/AH7rvv06qn/preview-i18n.webp)

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

- [🔗 Credits](#-credits)

####

</details>

## ✨ Features

- 🤖 Automated i18n translation using ChatGPT
- ✂️ Support for automatic splitting of large files to avoid ChatGPT token limitations
- ♻️ Incremental updates for i18n, extracting new content based on entry files
- 🗂️ Support for single file mode (`en.json`) and folder mode (`en/common.json`), compatible with `i18next`
- 🌲 Support for both `flat` and `tree` locale files
- 🛠️ Customization options for OpenAI model, API proxy, and temperature

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe i8n, run the following command:

```bash
npm install -g @lobehub/i18n-cli
```

> 👉 _Note: Make sure you have Node.js version >= 18_

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

To initialize the Lobe i8n configuration, run the following command:

```shell
$ lobe-i18n --config # or use the short flag -o
```

- To use AI auto-generation, fill in the [OpenAI token](https://platform.openai.com/account/api-keys) in the settings

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

You can use Gitpod for online development:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-url]

Alternatively, you can clone the repository and run the following commands for local development:

```bash
$ git clone https://github.com/canisminor1990/lobe-commit.git
$ cd lobe-i18n
$ npm install
$ npm start
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Credits

- langchainjs: <https://github.com/hwchase17/langchainjs>
- transmart: <https://github.com/Quilljou/transmart>
- ink: <https://github.com/vadimdemedes/ink>

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [CanisMinor][profile-url]. <br /> This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[profile-url]: https://github.com/canisminor1990
[gitpod-url]: https://gitpod.io/#https://github.com/canisminor1990/lobe-commit

<!-- SHIELD LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

<!-- release -->

[release-shield]: https://img.shields.io/npm/v/@lobehub/i18n-cli?label=%F0%9F%A4%AF%20NPM
[release-url]: https://www.npmjs.com/package/@lobehub/i18n-cli

<!-- releaseDate -->

[release-date-shield]: https://img.shields.io/github/release-date/canisminor1990/lobe-commit?style=flat
[release-date-url]: https://github.com/canisminor1990/lobe-commit/releases

<!-- releaseDownload -->

[release-download-shield]: https://img.shields.io/npm/dt/@lobehub/i18n-cli

<!-- ciTest -->

[ci-test-shield]: https://github.com/canisminor1990/lobe-commit/workflows/Test%20CI/badge.svg
[ci-test-url]: https://github.com/canisminor1990/lobe-commit/actions/workflows/test.yml

<!-- ciRelease -->

[ci-release-shield]: https://github.com/lobehub/lobe-commit/actions/workflows/release.yml/badge.svg
[ci-release-url]: https://github.com/lobehub/lobe-commit/actions/workflows/release.yml

<!-- contributors -->

[contributors-shield]: https://img.shields.io/github/contributors/canisminor1990/lobe-commit.svg?style=flat
[contributors-url]: https://github.com/canisminor1990/lobe-commit/graphs/contributors

<!-- forks -->

[forks-shield]: https://img.shields.io/github/forks/canisminor1990/lobe-commit.svg?style=flat
[forks-url]: https://github.com/canisminor1990/lobe-commit/network/members

<!-- stargazers -->

[stargazers-shield]: https://img.shields.io/github/stars/canisminor1990/lobe-commit.svg?style=flat
[stargazers-url]: https://github.com/canisminor1990/lobe-commit/stargazers

<!-- issues -->

[issues-shield]: https://img.shields.io/github/issues/canisminor1990/lobe-commit.svg?style=flat
[issues-url]: https://github.com/canisminor1990/lobe-commit/issues/new/choose
