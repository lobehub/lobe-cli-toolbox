---
name: managing-dependencies
description: >
  Add, remove or upgrade npm dependencies in the lobe-cli-toolbox monorepo without breaking the
  published CLIs. Covers which package.json a dependency belongs in when code lives in the bundled
  private packages (@lobehub/cli-ui, @lobehub/cli-common), workspace:* rules, the upgrade checklist,
  and verifying with `pnpm run smoke`. Trigger on: add a dependency, upgrade deps, bump packages,
  renovate PR, ERR_MODULE_NOT_FOUND from a built CLI, "Cannot find package" after publish,
  tsdown onlyBundle error, 升级依赖, 添加依赖.
---

# Managing dependencies

The CLIs are published to npm, but part of their code comes from two private workspace packages that tsdown bundles into each CLI's `dist/cli.js`. Bundled code keeps its third-party imports external, so **the CLI that bundles it must declare them**. Getting this wrong builds fine and passes unit tests, but crashes for users with `ERR_MODULE_NOT_FOUND`.

## Where a dependency goes

| Code that imports it                              | Add it to                                                                                    |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| One CLI's own `src/`                              | That CLI's `dependencies`                                                                    |
| `packages/lobe-cli-ui/src`                        | `lobe-cli-ui` `dependencies` **and** the `dependencies` of every CLI that uses `@lobehub/cli-ui` |
| `packages/common/src`                             | `common` `dependencies` **and** the `dependencies` of every CLI that imports that module     |
| Types only (`@types/*`)                           | `devDependencies` of the package, or the root if every package needs it                      |
| Build / lint / test tooling                       | Root `devDependencies`                                                                       |
| `@lobehub/cli-ui`, `@lobehub/cli-common`          | `devDependencies` as `workspace:*` (never `dependencies`)                                    |

Find the CLIs that bundle a shared module before editing:

```bash
rg -l "@lobehub/cli-common/<module>|@lobehub/cli-ui" packages/*/src
```

Optional peer dependencies count too: `zustand/traditional` needs `use-sync-external-store`, so `lobe-commit` lists it explicitly.

Each CLI's `tsdown.config.ts` sets `deps: { onlyBundle: [] }`: tsdown fails the build if anything from `node_modules` would be bundled. If that error appears, the package is missing from the CLI's `dependencies`; add it there instead of allow-listing it.

## Upgrading

1. Check the latest version and its engines: `npm view <pkg> version engines`. The floor is Node `>=22.18.0`; do not accept a version that needs more.
2. Read the changelog for majors. Past breaking changes in this repo: `pangu` 10 renamed `spacing` → `spaceText`; `conf` 16 rejects `undefined` values in `set()`; `@octokit/rest` dropped the unprefixed endpoint methods (use `octokit.rest.*`).
3. Update the range in **every** package that lists the dependency (`rg '"<pkg>"' packages/*/package.json package.json`) so the bundled copies agree.
4. `pnpm install`. There is no lockfile; `resolutionMode: highest` picks the newest matching versions. New build scripts must be approved in `allowBuilds` in `pnpm-workspace.yaml`.

## Verify

```bash
pnpm run ci                        # lint + type-check (TypeScript 7) + tests
pnpm run build && pnpm run smoke   # runs each built CLI from its own package dir
```

Because pnpm only links a package's declared dependencies, `smoke` running `packages/<cli>/dist/cli.js` catches a dependency that is missing from that CLI. Removing a dependency is the same check in reverse: `rg` for imports first, and run `smoke` afterwards.
