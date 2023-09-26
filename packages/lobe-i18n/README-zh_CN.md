<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/globe-showing-asia-australia.webp">

<h1>Lobe i18n</h1>

Lobe i18n 是一款使用 ChatGPT 自动化 i18n 的 CLI 流程工具

[English](./README.md)・简体中文・[Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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
- [🤝 参与贡献](#-参与贡献)
- [🔗 链接](#-链接)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ 特性

- [x] 🤖 利用 ChatGPT 实现 i18n 翻译自动化
- [x] ✂️ 支持大型文件自动分割，不必担心 ChatGPT token 限制
- [x] ♻️ 支持 i18n 增量更新，按照 `entry` 文件自动提取新增内容
- [x] 🗂️ 支持单文件模式 `en.json` 和文件夹 `en/common.json` 模式，完美配合 `i18next` 使用
- [x] 🌲 支持 `扁平` 和 `树状` locale 文件
- [x] 🛠️ 支持自定义 OpenAI 模型、API 代理、temperature

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 安装

要安装 Lobe i8n，请运行以下命令：

```bash
npm install -g @lobehub/i18n-cli
```

> **Note**\
> 请确保 \* _Node.js_ _版本_ _>= 18_

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 使用

要初始化配置 Lobe i8n，请运行以下命令：

```shell
$ lobe-i18n --config # 或使用短标志 -o
```

> **Important**\
> 要使用 AI 自动生成，需要在设置中填写 [OpenAI 令牌](https://platform.openai.com/account/api-keys)

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

可以使用 Github Codespaces 进行在线开发：

[![][github-codespace-shield]][github-codespace-link]

或者，可以克隆存储库并运行以下命令进行本地开发：

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

## 🤝 参与贡献

我们非常欢迎各种形式的贡献。如果你对贡献代码感兴趣，可以查看我们的 GitHub [Issues][github-issues-link]，大展身手，向我们展示你的奇思妙想。

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 链接

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
