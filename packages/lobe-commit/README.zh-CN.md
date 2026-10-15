<div align="center"><a name="readme-top"></a>

<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/T6E4BDoMNb/lobe-cli.webp">
<img height="120" src="https://raw.githubusercontent.com/lobehub/lobe-assets/master/packages/assets-logo/assets/split.svg">
<img height="120" src="https://raw.githubusercontent.com/lobehub/lobe-assets/master/packages/assets-emoji/assets/love-letter.webp">

<h1>Lobe Commit</h1>

Lobe Commit 是一款使用 ChatGPT 生成基于 Gitmoji 的 CLI 提交工具

[English](./README.md)・简体中文・[Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

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
<summary><kbd>文档目录</kbd></summary>

#### TOC

- [✨ 特性](#-特性)
- [📦 安装](#-安装)
- [🤯 使用](#-使用)
  - [Git hook](#git-hook)
  - [配置](#配置)
  - [运行](#运行)
  - [选项](#选项)
- [⌨️ 本地开发](#️-本地开发)
- [🤝 参与贡献](#-参与贡献)
- [🔗 链接](#-链接)
  - [More Products](#more-products)
  - [Credits](#credits)

####

</details>

## ✨ 特性

- [x] 🤯 支持使用 ChatGPT 根据 git diffs 自动生成提交信息
- [x] 🛠️ 流畅的提交信息编辑流程
- [x] 😜 支持添加 Gitmoji
- [x] 📝 支持 Conventional Commits 规范
- [x] ⚡️ 支持拉取 issues 列表并便捷绑定
- [x] 💄 支持自定义 Prompt
- [x] 🗺️ 支持多语言提交信息

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 安装

要安装 Lobe Commit，请运行以下命令：

```bash
npm install -g @lobehub/commit-cli
```

> \[!IMPORTANT]\
> 请确保环境中 `Node.js` 版本 **>= 18**

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 使用

使用 `lobe-commit` 命令为暂生成提交信息信息：

```shell
$ git add <files...>
$ lobe-commit
```

> \[!NOTE]\
> 如果认为 `lobe-commit` 太长了，可以使用`lobe`别名

<br/>

#### AI 模式

在 AI 模式下，可以使用 ChatGPT 生成完整的提交信息

> \[!IMPORTANT]\
> 需要在设置中 `lobe-commit -o` 配置 OpenAI 令牌，同时如果有特殊的网络要求，也可以在设置中配置 OpenAI 的转发地址

![](https://gw.alipayobjects.com/zos/kitchen/qmXcNvnjKf/preview-ai.webp)

<br/>

#### 编辑器模式

在编辑器模式下，可以通过简单的流程生成 `<type>(<optional scope>): <subject> [<issues>]` 格式的提交信息，使用 <kbd>TAB</kbd> 返回上一步

> \[!NOTE]\
> 如果项目是 GitHub Repo，则将自动获取该仓库的 issues，可以使用 <kbd>空格</kbd> 选择多个问题将其链接到提交信息中
>
> **私密仓库自动跳过**: 当处理私密仓库时，如果您未配置 GitHub 令牌或遇到认证问题，工具将自动跳过 issues 链接步骤并继续进行提交生成。这样可以防止工作流程卡住，同时仍允许在需要时手动链接 issues。

![](https://gw.alipayobjects.com/zos/kitchen/QkJ5V8nbY6/preview-editor.webp)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Git hook

可以通过 `prepare-commit-msg`钩子将 Lobe Commit 与 Git 集成，允许像往常一样使用 Git 并在提交之前编辑提交信息

<br/>

#### 安装

要在项目中安装 hook，请运行以下命令：

```shell
$ lobe-commit --init # 或使用短标志 -i
```

<br/>

#### 卸载

要从项目中卸载 hook，请运行以下命令：

```shell
$ lobe-commit --remove # 或使用短标志 -r
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 配置

要配置 Lobe Commit，请运行以下命令：

```shell
$ lobe-commit --option # 或使用短标志 -o
```

### 运行

要进行 commit 提交，请运行以下命令：

```shell
$ lobe-commit --hook # 两个命令任选其一
$ git commit
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

- 要使用 AI 自动生成，需要在设置中填写 [OpenAI 令牌](https://platform.openai.com/account/api-keys)
- 要自动拉取私人仓库 issues，需要在设置中填写具有 repo 权限的 [GitHub 令牌](https://github.com/settings/tokens)

> \[!NOTE]\
> **GitHub 令牌配置**: 对于私密仓库或当您想要自动链接 issues 时，您需要配置具有适当权限的 GitHub 令牌。如果未提供令牌或存在认证问题（无效令牌、网络超时等），工具将自动跳过 issues 链接步骤并继续提交过程。您仍然可以在需要时手动输入 issue 编号。
>
> **错误处理**: 工具优雅地处理各种场景，包括：
>
> - 未配置 GitHub 令牌
> - 无效或过期的令牌
> - 网络连接问题
> - 私密仓库访问限制
> - API 速率限制和超时

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 选项

Lobe Commit 支持以下选项：

```shell
--hook 使用基于提示的交互方式进行 commit 提交
-a, --ai 由 Ai 生成提示
-o, --option 设置 lobe-commit 首选项
-i, --init 将 lobe-commit 初始化为提交钩子
-r, --remove 移除先前初始化的提交钩子
-l, --list 列出所有支持的提交类型
-V, --version 打印 lobe-commit 的安装版本
-h, --help 打印基本选项
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
$ cd packages/lobe-commit
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
