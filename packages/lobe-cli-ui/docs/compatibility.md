# compatibility.json

`packages/lobe-cli-ui/compatibility.json` matches docs-kit's `DocumentationInventory`
shape (`demoReferences`, `documents`) — the same as `emptyLegacyRedirects` in
`@lobehub/docs-kit`.

It is **not** faking Ink/xterm compatibility. docs-kit's demo compiler always
`addWatchFile`s `<root>/compatibility.json`. When the file is missing, Vite 8
can fail resolving that path as an import from `lobe-docs:demo-descriptor:*`
(HTTP 500). An empty inventory is valid and sufficient until we publish legacy
demo IDs from a real `writeCompatibilityManifest` build.
