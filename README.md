<a name="readme-top"></a>

<div align="center">
  
<img width="200" src="https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/logo.webp">

<h1 align="center">Lobe Commit</h1>

Lobe Commit is a CLI tool that uses ChatGPT to generate Gitmoji-based commit messages
  
English · [简体中文](./README-zh_CN.md) · [Changelog](./CHANGELOG.md) · [Report Bug][issues-url] · [Request Feature][issues-url]

<!-- SHIELD GROUP -->

[![release][release-shield]][release-url] [![releaseDate][release-date-shield]][release-date-url] [![ciTest][ci-test-shield]][ci-test-url] [![ciRelease][ci-release-shield]][ci-release-url] <br/> [![contributors][contributors-shield]][contributors-url] [![forks][forks-shield]][forks-url] [![stargazers][stargazers-shield]][stargazers-url] [![issues][issues-shield]][issues-url]

</div>

![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview.webp)

## ✨ Features

- [x] 🤯 Supports auto-generating commit messages based on diffs using ChatGPT
- [x] 🛠️ Supports streamlined commit message editing workflow
- [x] 😜 Supports adding Gitmojis
- [x] 📝 Supports Conventional Commits specification
- [x] ⚡️ Supports pulling a list of issues and convenient binding
- [ ] 🚧 Supports multi-language commit messages
- [ ] 🚧 Supports custom prompts

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 📦 Installation

To install Lobe Commit, run the following command:

```bash
npm install -g @lobehub/commit-cli
```

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🤯 Usage

You can use the `lobe-commit` command to generate a commit message for your staged changes:

```shell
$ git add <files...>
$ lobe-commit
```

> 👉 Tip: Use the `lobe` alias if `lobe-commit` is too long for you.

<br/>

#### AI mode

With AI mode, you can generate a complete commit message using ChatGPT.

> 👉 Tip: To use AI auto-generation, you need to fill in your OpenAI token in the settings by `lobe-commit -o`. and if you have special network requirements, you can add OpenAI's forwarding address in the settings.

![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview-ai.webp)

<br/>

#### Editor mode

In Editor mode, you can choose the `<type>(<optional scope>): <subject> [<issues>]` format by following a simple flow.

> 👉 Tip: If your project is a GitHub repository, the Editor mode feature will automatically fetch the issues associated with your repository. You can select multiple issues to link to your commit message by <kbd>space</kbd> .

![](https://raw.githubusercontent.com/canisminor1990/lobe-commit/master/docs/preview-editor.webp)

<br/>

### Git hook

You can integrate Lobe Commit with Git via the `prepare-commit-msg` hook. This allows you to use Git as you normally would and edit the commit message before committing.

<br/>

#### Install

To install the hook in the Git repository, run the following command:

```shell
$ lobe-coomit --init   # or use short flag -i
```

<br/>

#### Uninstall

To uninstall the hook from the Git repository, run the following command:

```shell
$ lobe-coomit --remove   # or use short flag -r
```

<br/>

### Configuration

To configure Lobe Commit, run the following command:

```shell
$ lobe-coomit --config   # or use short flag -o
```

- To use AI auto-generation, you need to fill in your [OpenAI token](<(https://platform.openai.com/account/api-keys)>) in the settings.
- To automatically pull private issues, you need to fill in your [GitHub token](https://github.com/settings/tokens) with repo permissions in the settings.

<br/>

### Options

Lobe Commit supports the following options:

```shell
--commit  -c       Interactively commit using the prompts
--config  -o       Setup lobe-commit preferences
--help    -h       Print basic options
--init    -i       Initialize lobe-commit as a commit hook
--remove  -r       Remove a previously initialized commit hook
--list    -l       List all the available commit type
--version -v       Print lobe-commit installed version
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
$ cd lobe-commit
$ npm install
$ npm start
```

<br/>

## 🤝 Contributing

<!-- CONTRIBUTION GROUP -->

> 📊 Total: <kbd>**3**</kbd>

<a href="https://github.com/canisminor1990" title="canisminor1990">
  <img src="https://avatars.githubusercontent.com/u/17870709?v=4" width="50" />
</a>
<a href="https://github.com/apps/dependabot" title="dependabot[bot]">
  <img src="https://avatars.githubusercontent.com/in/29110?v=4" width="50" />
</a>
<a href="https://github.com/actions-user" title="actions-user">
  <img src="https://avatars.githubusercontent.com/u/65916846?v=4" width="50" />
</a>

<!-- CONTRIBUTION END -->

<div align="right">

[![][back-to-top]](#readme-top)

</div>

## 🔗 Credits

- gitmoji-cli: https://github.com/carloscuesta/gitmoji-cli
- ai-commit: https://github.com/insulineru/ai-commit

<div align="right">

[![][back-to-top]](#readme-top)

</div>

---
#### 📝 License

Copyright © 2023 [CanisMinor][profile-url]. <br />
This project is [MIT](./LICENSE) licensed. 


<!-- LINK GROUP -->

[profile-url]: https://github.com/canisminor1990
[issues-url]: https://github.com/canisminor1990/lobe-commit/issues/new/choose
[gitpod-url]: https://gitpod.io/#https://github.com/canisminor1990/lobe-commit

<!-- SHIELD LINK GROUP -->

[back-to-top]: https://img.shields.io/badge/-BACK_TO_TOP-151515?style=flat-square

<!-- release -->

[release-shield]: https://img.shields.io/npm/v/@lobehub/commit-cli?label=%F0%9F%A4%AF%20NPM
[release-url]: https://www.npmjs.com/package/@lobehub/commit-cli

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
[issues-url]: https://img.shields.io/github/issues/canisminor1990/lobe-commit.svg?style=flat
