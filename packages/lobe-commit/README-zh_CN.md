<a name="readme-top"></a>

<div align="center">

<img height="120" src="https://npm.elemecdn.com/@lobehub/assets-logo@1.0.0/assets/logo-3d.webp">
<img height="120" src="https://gw.alipayobjects.com/zos/kitchen/qJ3l3EPsdW/split.svg">
<img height="120" src="https://npm.elemecdn.com/fluentui-emoji/icons/modern/love-letter.svg">

<h1 align="center">Lobe Commit</h1>

Lobe Commit 是一款使用 ChatGPT 生成基于 Gitmoji 的 CLI 提交工具

[English](./README.md) · 简体中文 · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

<!-- SHIELD GROUP -->

[![release][release-shield]][release-url] ![][release-download-shield] [![releaseDate][release-date-shield]][release-date-url] [![ciTest][ci-test-shield]][ci-test-url] [![ciRelease][ci-release-shield]][ci-release-url] <br/> [![contributors][contributors-shield]][contributors-url] [![forks][forks-shield]][forks-url] [![stargazers][stargazers-shield]][stargazers-url] [![issues][issues-shield]][issues-url]

</div>

![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview.webp)

<details>
<summary><kbd>文档目录</kbd></summary>

#### TOC

- [✨ 特性](#-特性)

- [📦 安装](#-安装)

- [🤯 使用](#-使用)

  - [Git hook](#git-hook)
  - [配置](#配置)
  - [选项](#选项)

- [⌨️ 本地开发](#️-本地开发)

- [🔗 链接](#-链接)

####

</details>

## ✨ 特性

- 🤯 支持使用 ChatGPT 根据 git diffs 自动生成提交信息
- 🛠️ 流畅的提交信息编辑流程
- 😜 支持添加 Gitmoji
- 📝 支持 Conventional Commits 规范
- ⚡️ 支持拉取 issues 列表并便捷绑定
- 💄 支持自定义 Prompt
- 🗺️ 支持多语言提交信息

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 安装

要安装 Lobe Commit，请运行以下命令：

```bash
npm install -g @lobehub/commit-cli
```

> 👉 提示：请确保 Node.js 版本 >= 18

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 使用

使用 `lobe-commit` 命令为暂生成提交信息信息：

```shell
$ git add <files...>
$ lobe-commit
```

> 👉 提示：如果认为 `lobe-commit` 太长了，可以使用`lobe`别名

<br/>

#### AI 模式

在 AI 模式下，可以使用 ChatGPT 生成完整的提交信息

> 👉 提示：需要在设置中 `lobe-commit -o` 配置 OpenAI 令牌，同时如果有特殊的网络要求，也可以在设置中配置 OpenAI 的转发地址
>
> ![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview-ai.webp)

<br/>

#### 编辑器模式

在编辑器模式下，可以通过简单的流程生成 `<type>(<optional scope>): <subject> [<issues>]` 格式的提交信息

> 👉 提示：如果项目是 GitHub Repo，则将自动获取该仓库的 issues，可以使用 <kbd>空格</kbd> 选择多个问题将其链接到提交信息中

![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview-editor.webp)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### Git hook

可以通过 `prepare-commit-msg`钩子将 Lobe Commit 与 Git 集成, 允许像往常一样使用 Git 并在提交之前编辑提交信息

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
$ lobe-commit --config # 或使用短标志 -o
```

- 要使用 AI 自动生成，需要在设置中填写 [OpenAI 令牌](https://platform.openai.com/account/api-keys)
- 要自动拉取私人仓库 issues，需要在设置中填写具有 repo 权限的 [GitHub 令牌](https://github.com/settings/tokens)

<div align="right">

[![][back-to-top]](#readme-top)

</div>

### 选项

Lobe Commit 支持以下选项：

```shell
--commit -c 使用提示交互式提交
--config -o 设置lobe-commit首选项
--help -h 打印基本选项
--init -i 将lobe-commit初始化为提交钩子
--remove -r 删除先前初始化的提交钩子
--list -l 列出所有可用的提交类型
--version -v 打印lobe-commit安装版本
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

可以使用 Gitpod 进行在线开发：

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)][gitpod-url]

或者，可以克隆存储库并运行以下命令进行本地开发：

```bash
$ git clone https://github.com/canisminor1990/lobe-commit.git
$ cd lobe-commit
$ npm install
$ npm start
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 链接

- gitmoji-cli: <https://github.com/carloscuesta/gitmoji-cli>
- ai-commit: <https://github.com/insulineru/ai-commit>

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

[release-shield]: https://img.shields.io/npm/v/@lobehub/commit-cli?label=%F0%9F%A4%AF%20NPM
[release-url]: https://www.npmjs.com/package/@lobehub/commit-cli

<!-- releaseDownload -->

[release-download-shield]: https://img.shields.io/npm/dt/@lobehub/commit-cli

<!-- releaseDate -->

[release-date-shield]: https://img.shields.io/github/release-date/canisminor1990/lobe-commit?style=flat
[release-date-url]: https://github.com/canisminor1990/lobe-commit/releases

<!-- ciTest -->

[ci-test-shield]: https://github.com/canisminor1990/lobe-commit/workflows/Test%20CI/badge.svg
[ci-test-url]: https://github.com/canisminor1990/lobe-commit/actions/workflows/test.yml

<!-- ciRelease -->

[ci-release-shield]: https://github.com/canisminor1990/lobe-commit/workflows/Build%20and%20Release/badge.svg
[ci-release-url]: https://github.com/canisminor1990/lobe-commit/actions/workflows/release.yml

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
