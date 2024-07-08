<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://registry.npmmirror.com/@lobehub/assets-emoji/1.3.0/files/assets/globe-showing-asia-australia.webp">

<h1>Lobe i18n</h1>

Lobe i18n is a CLI workflow tool that uses ChatGPT for automated i18n.

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

![](https://gw.alipayobjects.com/zos/kitchen/AH7rvv06qn/preview-i18n.webp)

</div>

<details>
<summary><kbd>Table of Contents</kbd></summary>

#### TOC

- [✨ Features](#-features)
- [📦 Installation](#-installation)
- [🤯 Usage](#-usage)
  - [Configuration](#configuration)
  - [Environment Variable](#environment-variable)
- [🌏 Locale Configuration](#-locale-configuration)
  - [File Structure Selection](#file-structure-selection)
  - [Running](#running)
- [📝 Markdown Configuration](#-markdown-configuration)
  - [File Structure](#file-structure)
  - [Running](#running-1)
- [⌨️ Local Development](#️-local-development)
- [🤝 Contributing](#-contributing)
- [🔗 Links](#-links)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ Features

- [x] 🤖 Utilize ChatGPT for automated i18n translation
- [x] ✂️ Support automatic splitting of large files without worrying about ChatGPT token limits.
- [x] ♻️ Support incremental i18n updates, automatically extract new content based on `entry` files.
- [x] 🗂️ Support single file mode `en_US.json` and folder mode `en_US/common.json` to work perfectly with `i18next`.
- [x] 🌲 Support `flat` and `tree` structure for locale files.
- [x] 🛠️ Support customizing OpenAI models, API proxies, temperature and topP.
- [x] 📝 Support automated i18n translation of `Markdown` files.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe i18n, run the following command:

```bash
npm install -g @lobehub/i18n-cli
```

> \[!IMPORTANT]\
> Please make sure you have `Node.js` version **>= 18**.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

To initialize the Lobe i18n configuration, run the following command:

```shell
$ lobe-i18n -o # or use the full flag --option
```

> \[!IMPORTANT]\
> To use AI auto-generation, you need to fill in the [OpenAI Token](https://platform.openai.com/account/api-keys) in the settings.

```shell
# Translate Locale files
$ lobe-i18n # or $ lobe-i18n locale

# Translate Markdown files
$ lobe-i18n md

# Run i18n translation and markdown translation simultaneously
$ lobe-i18n --with-md

# Specify the configuration file
$ lobe-i18n -c './custom-config.js' # or use the full flag --config
```

<br/>

### Configuration

You can choose any configuration method in [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) format

- `i18n` property in `package.json`
- `.i18nrc` file in JSON or YAML format
- `.i18nrc.json`, `.i18nrc.yaml`, `.i18nrc.yml`, `.i18nrc.js`, `.i18nrc.cjs`
- `defineConfig` provides a secure definition method that can be imported from `@lobehub/i18n-cli`

> \[!TIP]
>
> This project provides a secure definition method `defineConfig` that can be imported from `@lobehub/i18n-cli`

<br/>

### Environment Variable

This project provides some additional configuration items set with environment variables:

| Environment Variable | Required | Description                                                                                                                                   | Example                                                                                   |
| -------------------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `OPENAI_API_KEY`     | Yes      | This is the API key you apply on the OpenAI account page                                                                                      | `sk-xxxxxx...xxxxxx`                                                                      |
| `OPENAI_PROXY_URL`   | No       | If you manually configure the OpenAI interface proxy, you can use this configuration item to override the default OpenAI API request base URL | `https://api.chatanywhere.cn/v1`<br/>The default value is<br/>`https://api.openai.com/v1` |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🌏 Locale Configuration

| Property Name | Required | Type           | Default Value   | Description                                                                  |
| ------------- | -------- | -------------- | --------------- | ---------------------------------------------------------------------------- |
| entry         | `*`      | `string`       | -               | Entry file or folder                                                         |
| entryLocale   | `*`      | `string`       | -               | Language to use as translation reference                                     |
| modelName     |          | `string`       | `gpt-3.5-turbo` | Model to use                                                                 |
| output        | `*`      | `string`       | -               | Location to store localized files                                            |
| outputLocales | `*`      | `string[]  `   | `[]`            | All the languages to be translated                                           |
| reference     |          | `string`       | -               | Provide some context for more accurate translations                          |
| splitToken    |          | `number`       | -               | Split the localized JSON file by tokens, automatically calculated by default |
| temperature   |          | `number`       | `0`             | Sampling temperature to use                                                  |
| topP          |          | `number`       | `1`             | Nucleus sampling threshold, controls the diversity of generated text         |
| concurrency   |          | `number`       | `5`             | Number of concurrently pending promises returned                             |
| experimental  |          | `experimental` | `{}`            | Experimental features, see below                                             |
| markdown      |          | `markdown`     | `{}`            | See `markdown` configuration below                                           |

#### `experimental`

| Property Name | Required | Type      | Default Value | Description                                                                                   |
| ------------- | -------- | --------- | ------------- | --------------------------------------------------------------------------------------------- |
| jsonMode      |          | `boolean` | `false`       | Enable gpt force JSON output for stability (only supported by new models after November 2023) |

<br/>

#### Example 1 `.i18nrc.js`

```js
const { defineConfig } = require('@lobehub/i18n-cli');

module.exports = defineConfig({
  entry: 'locales/en_US.json',
  entryLocale: 'en_US',
  output: 'locales',
  outputLocales: ['zh_CN', 'ja_JP'],
});
```

#### Example 2 `.i18nrc.json`

```json
{
  "entry": "locales/en_US.json",
  "entryLocale": "en_US",
  "output": "locales",
  "outputLocales": ["zh_CN", "ja_JP"]
}
```

#### Example 3 `package.json`

```json
{
  "...": "...",
  "i18n": {
    "entry": "locales/en_US.json",
    "entryLocale": "en_US",
    "output": "locales",
    "outputLocales": ["zh_CN", "ja_JP"]
  }
}
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### File Structure Selection

There are two types of file structures supported: `flat` and `tree`.

#### Flat Structure

A flat structure means that all translations for different languages are stored in a single file, as shown below:

```
- locales
  - en_US.json
  - ja_JP.json
  - zh_CN.json
  - ...
```

> \[!TIP]
>
> The `flat structure` requires configuring the `entry` property in the configuration file to the corresponding JSON file [Example](./examples/locale/flat/.i18nrc.cjs)

```json
{
  "entry": "locales/en.json",
  "entryLocale": "en_US",
  "output": "locales",
  "outputLocales": ["zh_CN", "ja_JP"]
}
```

#### Tree Structure

A tree structure means that the translations for each language are stored in separate language folders, as shown below:

```
- locales
  - en_US
    - common.json
    - header.json
    - subfolder
      - ...
  - ja_JP
    - common.json
    - header.json
    - subfolder
      - ...
  - zh_CN
    - common.json
    - header.json
    - subfolder
      - ...
```

> \[!TIP]
>
> The `tree structure` requires configuring the `entry` property in the configuration file to the corresponding folder [Example](./examples/locale/tree/.i18nrc.cjs)

```json
{
  "entry": "locales/en_US",
  "entryLocale": "en_US",
  "output": "locales",
  "outputLocales": ["zh_CN", "ja_JP"]
}
```

### Running

Use the `lobe-i18n` command to generate i18n files automatically:

```shell
$ lobe-i18n
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📝 Markdown Configuration

| Property Name    | Required | Type                        | Default                      | Description                                                             |
| ---------------- | -------- | --------------------------- | ---------------------------- | ----------------------------------------------------------------------- |
| entry            | `*`      | `string[]`                  | `[]`                         | Entry file or folder, supports `glob`                                   |
| entryLocale      |          | `string`                    | _Inherit parent locale_      | Reference language for translation                                      |
| entryExtension   |          | `string`                    | `.md`                        | Entry file extension                                                    |
| exclude          |          | `string[]`                  | `[]`                         | Files to be filtered, supports `glob`                                   |
| outputLocales    |          | `string[]`                  | _Inherit parent locale_      | All languages to be translated                                          |
| outputExtensions |          | `function`                  | `(locale) => '.{locale}.md'` | Output file extension generation                                        |
| mode             |          | `string`,`mdast`,`function` | `string`                     | Translation mode selection, explained below                             |
| translateCode    |          | `boolean`                   | `false`                      | Whether to translate code blocks under `mdast`, other modes are invalid |
| includeMatter    |          | `boolean`                   | `false`                      | Whether to include front matter in the translation                      |

#### `outputExtensions`

By default, the translated file names are generated as `.{locale}.md`. You can customize the output file extensions with `outputExtensions`.

> \[!NOTE]
>
> In the example below, the entry file extension is `.zh-CN.md`, but we want the output file extension for the `en-US` translation to be `.md`, while other languages keep the default extensions.

```js
module.exports = {
  markdown: {
    entry: ['./README.zh-CN.md', './docs/**/*.zh-CN.md'],
    entryLocale: 'zh-CN',
    entryExtension: '.zh-CN.md',
    outputLocales: ['en-US', 'ja-JP'],
    outputExtensions: (locale, { getDefaultExtension }) => {
      if (locale === 'en-US') return '.md';
      return getDefaultExtension(locale);
    },
  },
};
```

> `outputExtensions` supports the following `props`:

```ts
interface OutputExtensionsProps {
  /**
   * @description The locale of the translated file to output
   */
  locale: string;
  config: {
    /**
     * @description The content of the translated file to input
     */
    fileContent: string;
    /**
     * @description The path of the translated file to input
     */
    filePath: string;
    /**
     * @description The default method for generating extensions
     */
    getDefaultExtension: (locale: string) => string;
  };
}
```

#### `mode`

`mode` is used to specify the translation mode, which supports two modes and custom generation modes.

- `string` - Translates the complete `markdown` content.
- `mdast` - Parses the text with `mdast` structure and translates the `text value` content. To translate code blocks, you need to enable `translateCode`.

> \[!WARNING]
>
> In `mdast` mode, the content to be translated will be reduced to a minimum, removing most markdown syntax structures and links.
> This mode can greatly reduce token consumption, but it may result in inaccurate translation results.

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### File Structure

The translated files will be generated in the same directory as the entry file, with the corresponding language suffix added to the extension:

```
- README.md
- README.zh-CN.md
	- docs
		- usage.md
		- usage.zh-CN.md
		- subfolder
            - ...
```

> \[!TIP]
>
> [Example](./examples/markdown/.i18nrc.cjs)

### Running

Use the `lobe-i18n md` command to automate the generation of i18n files:

```shell
$ lobe-i18n md
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ Local Development

You can use Github Codespaces for online development:

[![][github-codespace-shield]][github-codespace-link]

Alternatively, you can clone the repository and run the following command for local development:

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

We welcome contributions in all forms. If you're interested in contributing code, you can check our GitHub [Issues][github-issues-link], show off your skills, and demonstrate your ideas.

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
This project is licensed under the [MIT](./LICENSE) license.

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
