<a name="readme-top"></a>

<div align="center">
<img height="120" src="https://npm.elemecdn.com/@lobehub/assets-logo@1.0.0/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://npm.elemecdn.com/fluentui-emoji/icons/modern/globe-showing-asia-australia.svg">

<h1 align="center">Lobe iI8n</h1>

Lobe i18n 是一款使用 ChatGPT 自动化 i18n 的 CLI 流程工具

[English](./README.md) · 简体中文 · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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
<summary><kbd>文档目录</kbd></summary>

#### TOC

- [✨ 特性](#-特性)

- [📦 安装](#-安装)

- [🤯 使用](#-使用)

  - [配置](#配置)
  - [结构选择](#结构选择)
  - [运行](#运行)
  - [](#-1)

- [⌨️ 本地开发](#️-本地开发)

- [🔗 链接](#-链接)

####

</details>

## ✨ 特性

- 🤖 利用 ChatGPT 实现 i18n 翻译自动化
- ✂️ 支持大型文件自动分割,不必担心 ChatGPT token 限制
- ♻️ 支持 i18n 增量更新，按照 `entry` 文件自动提取新增内容
- 🗂️ 支持单文件模式 `en.json` 和文件夹 `en/common.json` 模式，完美配合 `i18next` 使用
- 🌲 支持 `扁平` 和 `树状` locale 文件
- 🛠️ 支持自定义 OpenAI 模型、API 代理、temperature

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 安装

要安装 Lobe i8n，请运行以下命令：

```bash
npm install -g @lobehub/i18n-cli
```

> 👉 _提示：请确保_ _Node.js_ _版本_ _>= 18_

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 使用

要初始化配置 Lobe i8n，请运行以下命令：

```shell
$ lobe-i18n --config # 或使用短标志 -o
```

- 要使用 AI 自动生成，需要在设置中填写 [OpenAI 令牌](https://platform.openai.com/account/api-keys)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 配置

可以按照 [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) 格式任选配置方式

- `package.json` 中的 `i18n` 属性
- 以 JSON 或 YAML 格式的 `.i18nrc` 文件
- `.i18nrc.json`、`.i18nrc.yaml`、`.i18nrc.yml`、`.i18nrc.js`、`.i18nrc.mjs` 或 `.i18nrc.cjs` 文件
- `.config` 子目录中的 `i18nrc`、`i18nrc.json`、`i18nrc.yaml`、`i18nrc.yml`、`i18nrc.js` 或 `i18nrc.cjs` 文件
- `i18n.config.js`、`i18n.config.mjs` 或 `i18n.config.cjs` 文件

| 属性名称      | 类型      | 默认值            | 描述                             |
| ------------- | --------- | ----------------- | -------------------------------- |
| entry         | string    | -                 | 入口文件或文件夹                 |
| entryLocale   | string    | -                 | 作为翻译参考的语言               |
| modelName     | string    | `'gpt-3.5-turbo'` | 使用的模型                       |
| output        | string    | -                 | 存储本地化文件的位置             |
| outputLocales | string\[] | -                 | 需要进行翻译的所有语言           |
| reference     | string    | -                 | 提供一些上下文以获得更准确的翻译 |
| splitToken    | number    | `2000`            | 按令牌分割本地化 JSON 文件       |
| temperature   | number    | `0`               | 使用的采样温度                   |

**示例一 `.i18nrc.js`**

```js
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'locales/en.json',
  entryLocale: 'en',
  output: 'locales',
  outputLocales: ['zh_CN', 'jp'],
});
```

**示例二 `.i18nrc.json`**

```json
{
  "entry": "locales/en.json",
  "entryLocale": "en",
  "output": "locales",
  "outputLocales": ["zh_CN", "jp"]
}
```

**示例三 `package.json`**

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

### 结构选择

**单文件结构**

```
- locales
	- en.json
	- jp.json
	- zh_CN.json
	- ...
```

需要在配置文件中将 `entry` 配置为对应的 JSON 文件 [示例](./examples/flat/.i18nrc.cjs)

```json
{
  "entry": "locales/en.json",
  "entryLocale": "en",
  "output": "locales",
  "outputLocales": ["zh_CN", "jp"]
}
```

**文件夹结构**

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

需要在配置文件中将 `entry` 配置为对应的文件夹 [示例](./examples/tree/.i18nrc.cjs)

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

### 运行

使用 `lobe-i18n` 命令自动化生成 i18n 文件：

```shell
$ lobe-i18n
```

###

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

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

## 🔗 链接

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
