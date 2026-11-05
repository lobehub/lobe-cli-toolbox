<div align="center"><a name="readme-top"></a>

<img height="120" src="https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/assets/lobe-cli.webp">
<img height="120" src="https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/assets/split.svg">
<img height="120" src="https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/assets/magnifying-glass-tilted-left.webp">

<h1>Lobe SEO</h1>

Lobe SEO 是一款使用 ChatGPT 自动化 mdx 的 SEO Matter 的流程工具

[English](./README.md) ・ 简体中文 ・ [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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
<summary><kbd>文档目录</kbd></summary>

#### TOC

- [✨ 特性](#-特性)
- [📦 安装](#-安装)
- [🤯 使用](#-使用)
  - [AI Agent Skill](#ai-agent-skill)
  - [配置](#配置)
  - [环境变量](#环境变量)
- [🔍 配置](#-配置)
  - [运行](#运行)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [🔗 链接](#-链接)

####

</details>

## ✨ 特性

- [x] 🤖 利用 ChatGPT 实现 Seo Matter 自动化
- [x] ♻️ 支持 seo 增量更新，按照缺失 seo 信息自动新增内容
- [x] 🛠️ 支持自定义 OpenAI 模型、API 代理、temperature
- [x] 📝 支持 `Markdown` `Mdx` seo 自动化

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 安装

要安装 Lobe seo，请运行以下命令：

```bash
npm install -g @lobehub/seo-cli
```

> \[!IMPORTANT]\
> 请确保环境中 `Node.js` 版本 **>= 22**

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 使用

要初始化配置 Lobe i8n，请运行以下命令：

```shell
$ lobe-seo -o # 或使用完整标志 --option
```

> \[!IMPORTANT]\
> 要使用 AI 自动生成，请运行 `lobe-seo -o` 选择供应商、接口协议、API 地址、API 密钥和模型，或设置下方的 `LOBE_*` 环境变量

```shell
# 翻译 Locale 文件
$ lobe-seo

# 指定配置文件
$ lobe-seo -c './custom-config.js' # or use the full flag --config
```

<br/>

### AI Agent Skill

安装 `lobe-seo` skill，让 Claude Code、Cursor、Codex、Copilot 等编程 Agent 知道如何使用它：

```shell
$ lobe-seo skill                # 当前项目：.agents/skills，存在 .claude 时同时安装到 .claude/skills
$ lobe-seo skill --global       # 安装到用户目录
$ lobe-seo skill --agent claude # 只安装到 .claude/skills（可选 agents / claude）
```

旧版本写入的配置会在下次运行任意 `lobe-seo` 命令时自动迁移到新格式。

<br/>

### 配置

可以按照 [cosmiconfig](https://github.com/cosmiconfig/cosmiconfig) 格式任选配置方式

- `package.json` 中的 `seo` 属性
- 以 JSON 或 YAML 格式的 `.seorc` 文件
- `.seorc.json`、`.seorc.yaml`、`.seorc.yml`、`.seorc.js`、`.seorc.cjs` 文件

> \[!TIP]
>
> 本项目提供了 `defineConfig` 安全定义方法可以从 `@lobehub/seo-cli` 中导入

<br/>

### 环境变量

本项目提供了一些额外的配置项，使用环境变量进行设置：

| 环境变量           | 类型 | 描述                                                                                                                                                                                                                      | 示例                                                                     |
| ------------------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `LOBE_PROVIDER`    | 可选 | 供应商预设，优先于 `lobe-seo --option` 中的配置：`openai` `anthropic` `google` `deepseek` `qwen` `moonshot` `zhipu` `minimax` `openrouter` `siliconflow` `volcengine` `groq` `xai` `mistral` `ollama` `lmstudio` `custom` | `deepseek`                                                               |
| `LOBE_API_TYPE`    | 可选 | 接口协议：`chat-completions`（`/v1/chat/completions`）、`responses`（`/v1/responses`）、`anthropic`（`/v1/messages`）、`gemini`                                                                                           | `anthropic`                                                              |
| `LOBE_BASE_URL`    | 可选 | API 地址                                                                                                                                                                                                                  | `https://api.deepseek.com/anthropic`                                     |
| `LOBE_API_KEY`     | 可选 | API 密钥。各预设也会读取自己的变量，如 `ANTHROPIC_API_KEY` `GEMINI_API_KEY` `DEEPSEEK_API_KEY` `DASHSCOPE_API_KEY` `OPENROUTER_API_KEY`；`ollama` / `lmstudio` 无需密钥                                                   | `sk-xxxxxx...xxxxxx`                                                     |
| `OPENAI_API_KEY`   | 可选 | 旧版配置：未配置供应商时，与 `OPENAI_PROXY_URL` 一起按 OpenAI Chat Completions 兼容接口使用                                                                                                                               | `sk-xxxxxx...xxxxxx`                                                     |
| `OPENAI_PROXY_URL` | 可选 | 旧版配置：OpenAI 兼容接口地址                                                                                                                                                                                             | `https://api.chatanywhere.cn/v1`<br/>默认值: `https://api.openai.com/v1` |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔍 配置

| 属性名称       | 必填 | 类型           | 默认值     | 描述                                                                                       |
| -------------- | ---- | -------------- | ---------- | ------------------------------------------------------------------------------------------ |
| entry          | `*`  | `string`       | -          | 入口文件或文件夹                                                                           |
| entryExtension |      | `string`       | `.mdx`     | 入口文件扩展名                                                                             |
| groupKey       |      | `string`       | -          | 为 Seo Matter 设置 Gorup key                                                               |
| tagStringify   |      | `boolean`      | `false`    | 将 tags 字符串化                                                                           |
| modelName      |      | `string`       | 供应商默认 | 覆盖 `lobe-seo --option` 中选择的模型，如 `gpt-5-mini` `claude-sonnet-4-5` `deepseek-chat` |
| temperature    |      | `number`       | `0`        | 使用的采样温度                                                                             |
| reference      |      | `string`       | -          | 自定义 SEO 规则 prompt                                                                     |
| concurrency    |      | `number`       | `5`        | 同时并发的队列请求数量                                                                     |
| experimental   |      | `experimental` | `{}`       | 实验性功能，见下文                                                                         |

#### `experimental`

| 属性名称 | 必填 | 类型      | 默认值  | 描述                                                           |
| -------- | ---- | --------- | ------- | -------------------------------------------------------------- |
| jsonMode |      | `boolean` | `false` | 开启 gpt 强制 json 输出提升稳定性 (只支持 23 年 11 月后新模型) |

<br/>

#### 示例一 `.seorc.js`

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

#### 示例二 `.seorc.json`

```json
{
  "entry": "./docs/**/*.mdx",
  "experimental": {
    "jsonMode": true
  },
  "modelName": "gpt-3.5-turbo-1106"
}
```

#### 示例三 `package.json`

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

### 运行

使用 `lobe-seo` 命令自动化生成 seo 文件：

```shell
$ lobe-seo
```

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
$ cd packages/lobe-seo
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

- 🤯 [LobeHub](https://github.com/lobehub/lobehub) - 首席 Agent 运营官，帮你招募、调度并汇报整个 AI 团队的 7×24 运转
- 🍭 [Lobe UI](https://github.com/lobehub/lobe-ui) - 面向 AI 应用的 React 组件库
- 🥨 [Lobe Icons](https://github.com/lobehub/lobe-icons) - AI / LLM 品牌 Logo 与图标
- 📊 [Lobe Charts](https://github.com/lobehub/lobe-charts) - React 图表组件
- 🖋️ [Lobe Editor](https://github.com/lobehub/lobe-editor) - 基于 Lexical 的 React 富文本编辑器，支持 Markdown、插件与聊天输入框
- 📖 [Docs Kit](https://github.com/lobehub/docs-kit) - 可复用的文档工具包与 lobedocs CLI，用于 LobeHub 组件库文档
- 🌊 [Streamdown](https://github.com/lobehub/streamdown) - 面向 React 的无头流式 Markdown 引擎

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
[npm-release-link]: https://www.npmjs.com/package/@lobehub/seo-cli
[npm-release-shield]: https://img.shields.io/npm/v/@lobehub/seo-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-cli-toolbox/pulls
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
