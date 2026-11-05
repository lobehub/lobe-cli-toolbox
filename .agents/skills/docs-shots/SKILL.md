---
name: docs-shots
description: >
  用 docs/shots 为 lobe-cli-toolbox 的 README / 文档生成 CLI 终端示意图（ANSI → WebP）。
  涵盖 Vite 预览、pnpm shot / SnapDOM 截 [data-shot]、to-webp、Playwright 回退，以及 Grainient /
  行高 / 字符轨 / 实心光标等出图注意点。Trigger on: 出图, 截图, screenshot, docs shots,
  README 配图, terminal shot, ANSI WebP, pnpm shot, docs/shots, CLI 示意图.
---

# Docs shots（CLI 示意图出图）

仓库文档里的终端示意图统一走 **`docs/shots`**：Vite + Lobe UI + Grainient + Fluent Emoji，把真实 CLI ANSI 渲成卡片，再截成 PNG / WebP。

更细的脚本说明见 `docs/shots/README.md`；本 skill 给 agent 出图时用。

## 何时用

- 给 README / 本地 docs 补或更新 CLI 界面示意图
- 有一份 `.ansi` fixture（或能从真实 CLI 录一段 ANSI）需要出图
- **不要**在用户未明确要求时擅自把图写进 README；先出到 `docs/shots/out/`，路径用相对或 raw 链接

## 工作区

```text
docs/shots/          # 独立小包（Vite），不挂在 monorepo workspace 里
  fixtures/*.ansi    # ANSI 素材
  out/*.webp         # 产物（默认宽 1920）
  scripts/shot.mjs   # 一键：预览 → 截 [data-shot] → to-webp
```

技术栈：`@lobehub/ui`（ThemeScope · Grainient · token）· `@lobehub/fluent-emoji` · `@zumer/snapdom` · Playwright（浏览器宿主 / 回退）· sharp。

## 准备

```bash
cd docs/shots
pnpm install
pnpm exec playwright install chromium   # 首次需要
```

## 出图步骤

### 1. 准备 ANSI

把真实 CLI 输出存成 `docs/shots/fixtures/<name>.ansi`（或任意路径的 `.ansi`）。示例：`fixtures/commit-type.ansi`。

### 2. 一键出图（推荐）

在 `docs/shots` 下：

```bash
pnpm shot
pnpm shot -- fixtures/commit-type.ansi
# 或
node scripts/shot.mjs path/to/foo.ansi
```

流程：读 ANSI → 起本地 Vite（`127.0.0.1:5179`）→ 截页面上的 **`[data-shot]`** → 写 `out/<name>.png` → 自动跑 `to-webp`（默认宽 **1920**）→ `out/<name>.webp`。

默认截图引擎是 **SnapDOM**（页内 `window.__shotsCapture`，CSS 1× 布局 + `scale: 3`）。需要回退时：

```bash
SHOT_ENGINE=playwright pnpm shot
```

也可用场景名：`SHOT_SCENE=commit-type pnpm shot`。

### 3. 仅预览 / 调样式

```bash
pnpm dev
# http://127.0.0.1:5179/
# http://127.0.0.1:5179/?scene=commit-type
# http://127.0.0.1:5179/?src=/fixtures/commit-type.ansi
```

### 4. 已有 PNG，只转 WebP

```bash
pnpm to-webp
pnpm to-webp -- commit-type
WEBP_WIDTH=1920 pnpm to-webp
```

## 出图注意（易踩坑）

1. **不要把 Playwright viewport 缩成内容尺寸**。`shot.mjs` 用宽裕视口（约 1600×1200）；缩视口会让 panel 轨 / Grainient 重排挤歪。日志里也会写 `no viewport shrink`。
2. **Grainient 需要 `preserveDrawingBuffer`**。`src/main.tsx` 已 hook `getContext`，否则 SnapDOM / 截图会得到空白或 tainted canvas。
3. **行高固定** `--term-line-height: 1.285`（`src/styles.css`），不要随便改，否则与真实终端观感不一致。
4. **真实字符轨**：面板左右竖线是 ANSI 盒线字符（`.term-rail`），不是 CSS 画的 spine。
5. **实心光标**：用 `.term-cursor` 实心块，不要空心 outline / 假光标字形。
6. SnapDOM 失败时（例如 Grainient canvas / CORS emoji）会落到 Playwright `element.screenshot`；优先修渲染，不要默认长期用 Playwright 引擎。

## 产物与引用

- 输出目录：`docs/shots/out/*.webp`（顺带有同名 `.png`）
- 图放**本地 docs**；README 里用相对路径或 raw 路径引用，不要外链临时图床
- 未明确要求前，**不要**自动改 README 配图段落

## 快速对照

| 需求           | 命令 |
| -------------- | ---- |
| 默认出图       | `cd docs/shots && pnpm shot -- fixtures/<name>.ansi` |
| SnapDOM（默认）| `SHOT_ENGINE=snapdom pnpm shot` |
| Playwright 回退| `SHOT_ENGINE=playwright pnpm shot` |
| 浏览器预览     | `pnpm dev` → `http://127.0.0.1:5179/` |
| 只转 WebP      | `pnpm to-webp`（默认宽 1920） |

## 盒线乱码（AAAAAG）

若顶栏 `┌` 左侧出现字面量 `AAAAAG` / `AAAAA`：不是字体缺 glyph，而是 Ink 帧头的 CSI 光标控制（`CSI n A` 上移、`CSI G` 列复位、`CSI 2K` 清行等）被 `ansi-to-html` 漏成收尾字母。

处理在 `docs/shots/src/lib/ansiToTerminal.tsx` 的 `stripAnsiCursorControls`（由 `extractLastAnsiFrame` 调用），**不要**改 fixture 内容、不要用 CSS spine 硬画轨来掩盖。验证：转换后 HTML 不得以 `AAAA` 开头，出图顶栏应为干净 `┌`。
