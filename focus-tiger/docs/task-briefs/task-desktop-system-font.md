# Task Brief · T40 电脑版系统字体

> **状态（2026-10-24）**：PO 书面「B 波第一刀选 T40」「立刻开工」，并明示 **Brief 无需再点头**，本回合连贯执行。  
> **类**：**B**（电脑版全局 UI 字体从 Nunito/Quicksand 切到系统栈；网页不变）。  
> **代号**：**T40**（电脑版十二条对照 #6 · 执行序 5）。  
> **分支**：`feature/t40-desktop-system-font` · 基线 `origin/develop`。

## 一句话

Electron 电脑版用 macOS / Windows 系统无衬线（旧金山、苹方等），更像原生 App；浏览器 `:5173` 仍用 Nunito/Quicksand。不把全 App 标题统一加粗。

## 已经定下的做法

1. **仅 Electron 壳**  
   - `window.desktopShell.isDesktop === true` 时，在 `<html>` 挂 `ft-desktop-shell`，通过 CSS 变量 `--font-family` / `--ft-font-ui` 覆盖为系统栈。  
   - Web / Safari **不**挂类、**不**改 `design-tokens` 默认 Nunito。

2. **系统栈（无 Web 字体下载）**  
   - 主栈：`-apple-system`, `BlinkMacSystemFont`, `"SF Pro Text"`, `"SF Pro Display"`, `"PingFang SC"`, `"Hiragino Sans"`, `"Yu Gothic UI"`, `"Segoe UI"`, `system-ui`, `sans-serif`。  
   - 不新增 Google Fonts 请求；电脑版不依赖 Nunito 文件。

3. **衬线与金句**  
   - 现网刻意用的衬线（如 Iowan / 宋体金句卡）**不改**，只统一无衬线 UI 壳。

4. **字重**  
   - 禁止本刀顺手把全局 `font-weight` 抬高或给所有标题加粗。

## 冲突扫描（`SCENARIO_TESTS.md`）

| 相邻 | 三轴 | 结论 |
|---|---|---|
| Language 面板统一 Nunito（TEST_TRACKER） | 职责 | **无冲突（分面）**。该条锁 **Web**；电脑版本刀单独验收系统字体。 |
| Support / 付款 | 强度 | **无冲突**。不改 z-index、不改 Support 文案与 CTA。 |
| T49 不换网页壳 | 职责 | **一致**。只动电脑版字体，网页玻璃与 Nunito 保留。 |

强度：纯视觉，不比 Recover 更重。人设：不加说教文案。

## 变体矩阵（A10）

| 变体 | 入口 / 前置状态 | 预期（可见结果） | 自动化 |
|---|---|---|---|
| Electron 冷启动 | `desktop:dev` 宽屏 | 0–1s 内菜单/HUD/玻璃卡为系统无衬线（非圆体 Nunito 感） | `desktopSystemTypography.test.js` + 人工 |
| Web `:5173` | `?product=1` | 仍为 Nunito/Quicksand 栈；`html` **无** `ft-desktop-shell` | 单测 + 人工 |
| 日语界面 Electron | 切 ja | 系统栈下 CJK 可读（苹方/冬青等） | 人工 |
| 金句/衬线卡 | Quiet Line 等 | 衬线区块不变 | 不扩 scope |

**合规跳过（未触及）**：本刀不碰练习种类矩阵、付款 SKU、多语言入口逻辑——上表已覆盖字体可见面。

## 点击反馈（0–1 秒）（A14）

**不涉及可点击交互**（无新控件；字体切换随壳启动生效）。

## 边缘状态（A14）

| 边缘状态 | 预期 |
|---|---|
| `desktop:dev` 但 preload 未注入 | 与 Web 一致，仍 Nunito（无类） |
| 硬编码 `"Nunito"` 的少数样式块 | 改为 `var(--font-family)`，电脑版随 token 走系统栈 |
| 衬线 intentional | 保持原 `font-family` |

## 范围（out）

- 不删 ui-kit 的 Google Fonts（仍服务 Web / 文档 demo）。  
- 不做 T48 夜间亮度、不做 T49 原生壳重写。  
- 不改付款、倾诉发送链、菜单结构。

## 验收

- `cd focus-tiger && npm run test:smoke`（含 `desktopSystemTypography` 契约）。  
- 手测：Electron 宽屏 ⋯ / Language / Support 标题为系统字体；Safari 同页仍为 Nunito。
