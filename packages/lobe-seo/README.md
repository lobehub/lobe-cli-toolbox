<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/latest/files/assets/magnifying-glass-tilted-left.webp">

<h1>Lobe SEO</h1>

Lobe SEO is a workflow tool that automates SEO Matter using ChatGPT.

English ・ [简体中文](./README.zh-CN.md) ・ [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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

</div>

<details>
<summary><kbd>Table of Contents</kbd></summary>

#### TOC

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🤯 Usage](#-usage)
  - [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
- [🔍 Configuration](#-configuration)
  - [Running](#running)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🔗 Links](#-links)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ Features

- [x] 🤖 Automate SEO Matter using ChatGPT
- [x] ♻️ Support incremental SEO updates, automatically adding content for missing SEO information
- [x] 🛠️ Support custom OpenAI models, API proxies, temperature
- [x] 📝 Support `Markdown` `Mdx` SEO automation

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe SEO, run the following command:

```bash
npm install -g @lobehub/seo-cli
```

> \[!IMPORTANT]\
> Make sure your environment has `Node.js` version **>= 18**

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

To initialize Lobe i8n configuration, run the following command:

```shell
$ lobe-seo -o # or use the full flag --option
```

> \[!IMPORTANT]\
> To use AI auto-generation, you need to fill in the [OpenAI token](https://platform.openai.com/account/api-keys) in the settings

```shell
# Translate Locale files
$ lobe-seo

# Specify a configuration file
$ lobe-seo -c './custom-config.js' # or use the full flag --config
```

<br/>

### Configuration

You can choose any configuration method in [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) format

- `seo` property in `package.json`
- `.seorc` file in JSON or YAML format
- `.seorc.json`, `.seorc.yaml`, `.seorc.yml`, `.seorc.js`, `.seorc.cjs` files

> \[!TIP]
>
> This project provides a `defineConfig` secure definition method that can be imported from `@lobehub/seo-cli`

<br/>

### Environment Variables

Some additional configurations are provided in this project, set using environment variables:

| Environment Variable | Type     | Description                                                                                                                 | Example                                                                       |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Required | This is the API key you obtained from the OpenAI account page                                                               | `sk-xxxxxx...xxxxxx`                                                          |
| `OPENAI_PROXY_URL`   | Optional | If you manually configure an OpenAI API proxy, you can use this setting to override the default OpenAI API request base URL | `https://api.chatanywhere.cn/v1`<br/>Default:<br/>`https://api.openai.com/v1` |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔍 Configuration

| Property Name  | Required | Type           | Default Value   | Description                      |
| -------------- | -------- | -------------- | --------------- | -------------------------------- |
| entry          | `*`      | `string`       | -               | Entry file or folder             |
| entryExtension |          | `string`       | `.mdx`          | Entry file extension             |
| modelName      |          | `string`       | `gpt-3.5-turbo` | Model used                       |
| temperature    |          | `number`       | `0`             | Sampling temperature used        |
| experimental   |          | `experimental` | `{}`            | Experimental features, see below |

#### `experimental`

| Property Name | Required | Type      | Default Value | Description                                                                                                |
| ------------- | -------- | --------- | ------------- | ---------------------------------------------------------------------------------------------------------- |
| jsonMode      |          | `boolean` | `false`       | Enable GPT forced JSON output for stability improvement (only supported by new models after November 2023) |

<br/>

#### Example 1 `.seorc.js`

```js
const { defineConfig } = require('@lobehub/seo-cli');

module.exports = defineConfig({
  entry: './docs/**/*.mdx',
  modelName: 'gpt-3.5-turbo-1106',
  experimental: {
    jsonMode: true,
  },
});
```

#### Example 2 `.seorc.json`

```json
{
  "entry": "./docs/**/*.mdx",
  "experimental": {
    "jsonMode": true
  },
  "modelName": "gpt-3.5-turbo-1106"
}
```

#### Example 3 `package.json`

```json
{
  "...": "...",
  "seo": {
    "entry": "./docs/**/*.mdx",
    "modelName": "gpt-3.5-turbo-1106",
    "experimental": {
      "jsonMode": true
    }
  }
}
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Running

Automatically generate SEO files using the `lobe-seo` command:

```shell
$ lobe-seo
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Alternatively, you can clone the repository and run the following commands for local development:

[![][bun-shield]][bun-link]

```bash
$ git clone https://github.com/lobehub/lobe-cli-toolbox.git
$ cd lobe-cli-toolbox
$ bun install
$ cd packages/lobe-seo
$ bun dev
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 Contributing

We welcome contributions in all forms. If you are interested in contributing code, you can check out our GitHub [Issues][github-issues-link], showcase your creativity, and share your ideas with us.

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

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [LobeHub][profile-link]. <br />
This project is licensed under [MIT](./LICENSE).

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
[npm-release-link]: https://www.npmjs.com/package/@lobehub/seo-cli
[npm-release-shield]: https://img.shields.io/npm/v/@lobehub/seo-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-cli-toolbox/pulls
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
