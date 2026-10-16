# Task Brief · A13 关键卡片截图比对

> **状态（2026-10-16）**：口令「立刻开工 A13」；规格锁在 `root-cause-audit-2026-10-12.md` §4 A13。  
> **类**：**A**（不改产品行为；只加 e2e / 文档护栏。改卡面背景色 intentionally → 测试须红）。  
> **依赖**：A11.1 #1276、A11.2 #1278、A12 #1281 已合。  
> **不做**：改 `z-index` 数字；改 Stripe / 付款 CTA；宣称替代人工叠层观感关单。

## 一句话目标

约 12 处关键浮动卡 / chrome 在宽屏 Idle 下须仍是**暖米半透明玻璃**（不是 #1147 深色底、不是近乎不透明奶油板）。CI 用 **computed background RGB 契约**锁回归；可选元件软截图（`FT_A13_SOFT_SNAP=1`）。

## 范围（in）

- `src/core/glassCardVisualSurfaces.js` — 12 处表面清单（与根因盘点列举对齐）。  
- `e2e/glass-card-visual-guardrail.spec.js` — 逐项打开 → 断言暖米玻璃。  
- `e2e/helpers/glass-card-visual-guardrail.js` + `glassCardVisualGuardrail.test.js` — 运行时 / 静态深色夹具双锁。  
- `npm run test:glass-card-visual`；`warm sanctuary glass` 行进 `test:e2e:smoke`。  
- `DOC_CODE_CONTRACT.md` **A13-glass-visual** 行。

## 范围（out）

- 全页 / Yin 入镜快照。  
- 叠层谁压谁（A12 数字不变 ≠ 人眼已验）。  
- Chromatic 等第三方。  
- 窄屏变体矩阵（后续另开）。

## 变体矩阵

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

## 点击反馈（0–1 秒）

本次无可点击交互改动，点击反馈节跳过。

## 边缘状态

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

## 共用机制核对

- 触及 overlay / dim / Support 栈：本刀只**打开** Support 模态取样，不改层级；付款契约仍 `npm run test:payment-contract`。  
- A11 `check:glass-card-roots` 仍负责源码静态扫描；A13 负责**运行时**暖米取样。

## 验收

- [ ] `npm run test:smoke` 绿（含 `glassCardVisualGuardrail.test.js`）。  
- [ ] `npm run test:glass-card-visual` 绿。  
- [ ] 故意把某卡根 `background` 改成 `rgba(28,28,32,.92)` → 对应 e2e / 单测红。  
- [ ] 人工：Support 仍在遮罩之上、Subscribe 可点 — **未在本刀关单**（沿用 A12 PR 人工项）。
