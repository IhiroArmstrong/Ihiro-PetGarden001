# BUTTON_ICONS_PROMPT.md — 窄屏三主钮图标（v3 · brown-tan）

> **归档位置**：`focus-tiger/docs/`（本文件）。  
> **运行时路径**：`focus-tiger/public/icons/`（**不是** `public/sprites/...`）。  
> **源参考 sheet**：`focus-tiger/art-reference/button-icons/sheet-brown-tan-v3.png`

---

## 文件名与功能映射（权威）

| 功能 | 图腾 | 文件名 |
|---|---|---|
| Quick Start | 火焰 | `icon-quick-start.png` |
| Sit with Yin | 禅圆（Enso） | `icon-sit-with-yin.png` |
| Honesty Check-in | 爱心双手 | `icon-honesty-checkin.png` |

窄屏画布顺序：**Quick Start · Sit with Yin · Honesty**（与 `NarrowIdleShell` / `ASSET_INVENTORY` 一致）。

---

## 视觉版本

| 版本 | 说明 | 状态 |
|---|---|---|
| v1 | 白 badge + 投影 | 已替换 |
| v2 | 扁平几何裁切（风格不统一：纸刻橙 / 金环陶土） | 已替换 |
| **v3** | **统一 kraft 米褐圆底 + 深棕图腾**（火焰 / 禅圆 / 爱心双手）；正方形透明 PNG | **当前采用（2026-07-26）** |

规格：约 **480×480** RGBA；圆外透明；窄屏显示约 **72×72 CSS px**；缓存戳 `?v=4`。

---

## Cursor Prompt（粘贴即用）

```
将窄屏 Idle 三主钮图标替换为 v3（kraft 米褐圆底 + 深棕图腾），文件名不可改：

1. 覆盖（同名替换，不两版并存）：
   - focus-tiger/public/icons/icon-quick-start.png      ← 火焰
   - focus-tiger/public/icons/icon-sit-with-yin.png     ← 禅圆 Enso
   - focus-tiger/public/icons/icon-honesty-checkin.png  ← 爱心双手

2. 要求：
   - 正方形 PNG、圆外透明（RGBA）
   - 不改 click 逻辑 / 门闩 / Arrival keepQuickStart / 抽屉显隐
   - NarrowIdleShell.js 三个 ICON_* 缓存戳 bump 到 ?v=4（或下一可用戳）
   - 同步 ASSET_INVENTORY「UI 图标」、PROCESS 速览、TEST_TRACKER「窄屏 · 主屏三主钮」观感行（待人工测试；注明 v3 brown-tan）
   - 本文件 BUTTON_ICONS_PROMPT.md 的文件名表若有旧名，一并改成上述三个 kebab-case 名

3. 不做：
   - 不改宽屏 dock 文案 pill
   - 不新建 emotion key / sprites 路径
   - 不自动 push（除非用户明确要求 Git 同步）
```

---

## 抠图备忘（从 sheet 出单钮）

源 sheet：黑底横排三圆（左 Honesty / 中 Sit / 右 Quick）。

1. 按列密度分成三团；每团取内容外接圆。  
2. 以圆心裁正方形，圆外 alpha=0（软边约 1–2px）。  
3. 统一边长（当前 480）后写入上表文件名。
