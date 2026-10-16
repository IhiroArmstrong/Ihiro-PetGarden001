# Task Brief · A11 共享玻璃卡片强制

> **状态（2026-10-16）**：**PO 已点头变体矩阵**；A11.1 按 A 类落地（工厂 + 扫描，已用暖米玻璃的卡不换肤）。  
> **口令**：线 2「立刻开工 A11」——Brief 已锁；本刀只加工厂与扫描。  
> **类**：  
> - **本 Brief PR**：**A**（纯文档）。  
> - **A11.1 代码刀**：**A**（工厂 + 静态检查；已合规卡片外观不变）。  
> - 若某张卡根背景必须从非 token 改成暖米玻璃 → **升 B**，停下来改本 Brief 再动那张卡。  
> **依赖**：`glassPanelStyles.js` 已在；#1147 语音卡已用 `GLASS_FILL`。  
> **不做**：A12 层级常量化；A13 截图比对；A8 页面防呆。

## 一句话目标

浮动在画面上的**卡片根表面**只能走共享暖米玻璃（`createGlassCard()` / `glassPanelSurfaceDecls()`）。静态检查拦住「再画一张深色底板」。#1147 修复前的语音卡写法必须红。

## 为什么现在做

R8：`glassPanelStyles.js` 存在，但不调用也不会出错。#1147 只给语音卡加了一条检查。A13 截图要比对稳定玻璃，须先有强制面。

## 范围（in · 本 Brief；A11.1 落地）

- 新增 `createGlassCard()`（基于现有 `glassPanelStyles.js` token）。调用方仍自己管内容、position、padding、**z-index（留给 A12）**。  
- 静态扫描：登记过的浮动**卡根**不得自写非 token 面板背景。夹具：#1147 前深色语音卡必须失败。  
- 检查进 `docs:check` 或 `test:smoke`（与现网 lint 脚本同级，一次命令可复现）。  
- 本 Brief、task/issue/tracker 碎片。

## 范围（out）

- 不改 Stripe / Support CTA 行为。  
- `#yin-support-modal` 可继续用 `GLASS_FILL_STRONG`，**必须**留在 `GLASS_CARD_KEEP_STYLESHEET_Z`；工厂默认 **`deck: false`**，禁止给 Support 大卡自动打 `data-ft-glass-card`、禁止 inline 把 z 压到 18/19。  
- 不改 overlay dim、FAB、三球、扇形、灯笼、菜单逃生舱。  
- 不扫内层芯片 / 金 CTA / 开关轨道 / 错误红底（那些不是卡根）。  
- 不把 Honesty / Arrival 泡自动编进可拖玻璃叠层。  
- 不改 `z-index` 数字或 `Z_INDEX.md`（A12）。  
- 不做截图 CI（A13）。

## 变体矩阵（卡根）

| 表面 | 本刀期望 |
|---|---|
| `GLASS_CARD_ELEMENT_IDS` 里的居中卡根（含帮助、收藏、修行、问号类说明卡） | 面板背景 = `GLASS_FILL` 或 `GLASS_FILL_STRONG`（经工厂或 `glassPanelSurfaceDecls`） |
| `#yin-support-modal` | `GLASS_FILL_STRONG`；样式表 z=26；不可拖进 18/19 叠层 |
| 语音播报卡 `#1147` | `GLASS_FILL`；夹具深色 `rgba(28,26,24…)` 必须被扫描拦住 |
| Honesty / Arrival / Companion 点选 / 时长选择 **面板根** | 已用 token 则过；禁止再写近乎不透明奶油底或深色底板 |
| Support 遮罩 `.yin-support-backdrop` | **不在本刀**（那是 dim，不是玻璃卡） |
| 内按钮、金 CTA、mint 开关、列表行 hover | **不在本刀** |
| 宽/窄菜单 chrome、音符球、抽屉抓手 | **不在本刀** |

## 点击反馈（0–1 秒）

本 Brief 与 A11.1 不改点击结果。开卡后 0–1 秒仍是现网那张暖米玻璃；不新增静默。

## 共用机制核对

- **overlayBusy**：不改 `isSceneAnimOverlayBusy` / 第一幕 occupancy。开卡仍走现网 busy 门闩。  
- **HUD 呼吸**：不改 `overlayBreathing` 驱动者。  
- **z≥17 遮罩**：不改 dim；Support 大卡仍在遮罩之上（z 26）。FAB `#yin-support-fab` 可点。  
- **新建可点击叠层**：不新增 overlay 行；`createGlassCard({ deck:false })` 默认不登记 `data-ft-glass-card`。仅当调用方**显式** `deck: true` 且 id 已在 `GLASS_CARD_ELEMENT_IDS` 时才打标。  
- **后台网络**：不涉及。  
- **受保护路径**：工厂不得作用于「所有居中卡片」；Support 走 keep-stylesheet-z 豁免。

## 冲突扫描

相邻：场景 A/S 语音卡 sanctuary 玻璃 · Support 三卡 · Honesty 桥接半透明 · 玻璃叠层最多两张。  
强度 / 人设语气不变。职责仍是「卡根必须是暖米玻璃」，不是新入口、不是改付款文案。  
无冲突疑点。

## 已好清单

- 已用 `GLASS_FILL` / `GLASS_FILL_STRONG` 的卡，外观不故意改。  
- `#yin-support-modal` 不可拖、不可被叠层 inline z 压到遮罩下。  
- 语音卡继续 sanctuary 玻璃（#1147 单测仍在）。  
- Arrival / Honesty 半透明泡不被编进可拖 deck。  
- 菜单 `⋯` / 抽屉抓手不被本刀 hide。

## 验收（A11.1）

1. 夹具：#1147 前深色语音卡写法 → 扫描红。  
2. 现网已 token 化的登记卡根 → 扫描绿。  
3. `createGlassCard()` 默认不打 `data-ft-glass-card`；`keepStylesheetZ` 路径不返回 18/19。  
4. `npm run test:smoke` 绿；若动到玻璃叠层共享层 → `npm run test:payment-contract`。  
5. 不点击 Stripe。

## 分刀

| PR | 类 | 做什么 |
|---|---|---|
| **本 Brief** | A | 锁范围 |
| **A11.1** | A | 工厂 + 扫描 + #1147 夹具 |
| **A11.2** | 仅当有卡根仍非 token | 把那些卡根迁到工厂；有可见换肤则升 B |

## 并行线约定

- **线 1 A8**：页面可见文字防呆。本刀不碰 e2e 毒字 helpers。  
- **线 2 本刀 A11**：只动卡根背景 token / 工厂 / 扫描。  
- **线 3 A12**：只动 z-index。两线若改同一 UI 文件：A11 不改 z 行，A12 不改 `background` 行。  
- **A13** 等 A11.1 合入后再开。  
- **A10/A14–A21** 流程 Brief 在既有 `docs/root-cause-brief-gates-a10-a21` 树，不与本刀抢 `COLLAB.md`。
