<div align="center"><a name="readme-top"></a>

<img height="160" src="https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/assets/lobe-cli.webp">

<h1 align="center">Lobe CLI 工具箱</h1>

AI CLI 工具箱，提高 git 提交和国际化工作流的效率

[English](./README.md) ・ 简体中文 ・ [报告 Bug][github-issues-link] · [需求功能][github-issues-link]

<!-- SHIELD GROUP -->

[![][github-release-shield]][github-release-link]
[![][github-releasedate-shield]][github-releasedate-link]
[![][github-action-test-shield]][github-action-test-link]
[![][github-action-release-shield]][github-action-release-link]<br/>
[![][github-contributors-shield]][github-contributors-link]
[![][github-forks-shield]][github-forks-link]
[![][github-stars-shield]][github-stars-link]
[![][github-issues-shield]][github-issues-link]
[![][github-license-shield]][github-license-link]

![][split]

</div>

<br/>

## 🪀 CLI 工具

| [**💌 Lobe Commit**][lobe-commit-github] [(中文)][lobe-commit-github-cn]<br/>利用 Langchain/ChatGPT 生成基于 Gitmoji 的提交消息的 CLI 工具。<br/><br/>[![][lobe-commit-version] ![][lobe-commit-download]][lobe-commit-url]                                                               | [![][lobe-commit-cover]][lobe-commit-github] |
| :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------- |
| [**🌏 Lobe i18n**][lobe-i18n-github] [(中文)][lobe-i18n-github-cn]<br/>国际化翻译过程的自动化工具，由 ChatGPT 提供支持。支持大文件的自动分割、增量更新和自定义选项，可以选择 OpenAI 模型、API 代理和温度等功能。<br/><br/>[![][lobe-i18n-version] ![][lobe-i18n-download]][lobe-i18n-url] | [![][lobe-i18n-cover]][lobe-i18n-github]     |
| [**🔖 Lobe label**][lobe-label-github]<br/>自动从模板仓库复制问题标签。<br/><br/>[![][lobe-label-version] ![][lobe-label-download]][lobe-label-url]                                                                                                                                       | [![][lobe-label-cover]][lobe-label-github]   |
| [**🔍 Lobe SEO**][lobe-seo-github] [(中文)][lobe-seo-github-cn]<br/>利用 ChatGPT 自动生成 MDX SEO Matter 的 CLI 工具。<br/><br/>[![][lobe-seo-version] ![][lobe-seo-download]][lobe-seo-url]                                                                                              | [![][lobe-seo-cover]][lobe-seo-github]       |

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## ⌨️ 本地开发

你可以使用 Github Codespaces 进行在线开发：

[![][github-codespace-shield]][github-codespace-link]

或者克隆到本地进行开发：

```bash
$ git clone https://github.com/lobehub/lobe-cli-toolbox.git
$ cd lobe-cli-toolbox
$ corepack enable # 使用 package.json 中锁定的 pnpm 版本
$ pnpm install
$ pnpm run ci # lint + 类型检查 + 测试
$ pnpm run build && pnpm run smoke
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤝 贡献

欢迎各种类型的贡献，如果您有兴趣贡献代码，请随时查看我们的 GitHub [Issues][github-issues-link] 来展示你的才能。

[![][pr-welcome-shield]][pr-welcome-link]

[![][github-contrib-shield]][github-contrib-link]

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 链接

- **[LobeHub](https://github.com/lobehub/lobehub)**
- **[lobe ui](https://github.com/lobehub/lobe-ui)**
- **[lobe icons](https://github.com/lobehub/lobe-icons)**
- **[lobe charts](https://github.com/lobehub/lobe-charts)**
- **[lobe editor](https://github.com/lobehub/lobe-editor)**
- **[docs kit](https://github.com/lobehub/docs-kit)**
- **[stream down](https://github.com/lobehub/streamdown)**

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---

#### 📝 License

Copyright © 2023 [LobeHub][profile-link]. <br />
This project is [MIT](./LICENSE) licensed.

<!-- LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square
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
[github-license-link]: https://github.com/lobehub/lobe-cli-toolbox/blob/main/LICENSE
[github-license-shield]: https://img.shields.io/github/license/lobehub/lobe-cli-toolbox?color=white&labelColor=black&style=flat-square
[github-release-link]: https://github.com/lobehub/lobe-cli-toolbox/releases
[github-release-shield]: https://img.shields.io/github/v/release/lobehub/lobe-cli-toolbox?color=369eff&labelColor=black&logo=github&style=flat-square
[github-releasedate-link]: https://github.com/lobehub/lobe-cli-toolbox/releases
[github-releasedate-shield]: https://img.shields.io/github/release-date/lobehub/lobe-cli-toolbox?labelColor=black&style=flat-square
[github-stars-link]: https://github.com/lobehub/lobe-cli-toolbox/network/stargazers
[github-stars-shield]: https://img.shields.io/github/stars/lobehub/lobe-cli-toolbox?color=ffcb47&labelColor=black&style=flat-square
[lobe-commit-cover]: https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/preview.webp
[lobe-commit-download]: https://img.shields.io/npm/dt/@lobehub/commit-cli?labelColor=black&&style=flat-square
[lobe-commit-github]: https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-commit
[lobe-commit-github-cn]: https://github.com/lobehub/lobe-cli-toolbox/blob/master/packages/lobe-commit/README.zh-CN.md
[lobe-commit-url]: https://www.npmjs.com/package/@lobehub/commit-cli
[lobe-commit-version]: https://img.shields.io/npm/v/@lobehub/commit-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-i18n-cover]: https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/preview-i18n.webp
[lobe-i18n-download]: https://img.shields.io/npm/dt/@lobehub/i18n-cli?labelColor=black&&style=flat-square
[lobe-i18n-github]: https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-i18n
[lobe-i18n-github-cn]: https://github.com/lobehub/lobe-cli-toolbox/blob/master/packages/lobe-i18n/README.zh-CN.md
[lobe-i18n-url]: https://www.npmjs.com/package/@lobehub/i18n-cli
[lobe-i18n-version]: https://img.shields.io/npm/v/@lobehub/i18n-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-label-cover]: https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/preview-label.webp
[lobe-label-download]: https://img.shields.io/npm/dt/@lobehub/label-cli?labelColor=black&&style=flat-square
[lobe-label-github]: https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-label
[lobe-label-url]: https://www.npmjs.com/package/@lobehub/label-cli
[lobe-seo-cover]: https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/preview-seo.webp
[lobe-seo-download]: https://img.shields.io/npm/dt/@lobehub/seo-cli?labelColor=black&&style=flat-square
[lobe-seo-github]: https://github.com/lobehub/lobe-cli-toolbox/tree/master/packages/lobe-seo/README.md
[lobe-seo-github-cn]: https://github.com/lobehub/lobe-cli-toolbox/blob/master/packages/lobe-seo/README.zh-CN.md
[lobe-seo-url]: https://www.npmjs.com/package/@lobehub/seo-cli
[lobe-seo-version]: https://img.shields.io/npm/v/@lobehub/seo-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[lobe-label-version]: https://img.shields.io/npm/v/@lobehub/label-cli?color=369eff&labelColor=black&logo=npm&logoColor=white&style=flat-square
[pr-welcome-link]: https://github.com/lobehub/lobe-cli-toolbox/pulls
[pr-welcome-shield]: https://img.shields.io/badge/%F0%9F%A4%AF%20PR%20WELCOME-%E2%86%92-ffcb47?labelColor=black&style=for-the-badge
[profile-link]: https://github.com/lobehub
[split]: https://raw.githubusercontent.com/lobehub/lobe-cli-toolbox/master/docs/assets/rainbow.png
