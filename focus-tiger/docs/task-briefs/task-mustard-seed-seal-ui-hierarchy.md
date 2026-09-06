# Task Brief · 芥子须弥纪念印 · UI 层级优化（Phase A）

> 状态：**#612 已合** `origin/develop`  
> 前置：`task-mustard-seed-seal.md`（行为/文案不变）  
> Phase B：`task-mustard-seed-seal-ui-phase-b.md`（背景 dim / 阿寅露脸 / Save image）  
> 拍板（2026-09-07）：纯 UI 层级；**不改**三首中英文诗与印名；locale **主显 + 辅语言次要**；副标题 blurb **仅 `auto` 首次仪式**显示，`menu`/`force` 重读隐藏。

## 目标

降低纪念印卡信息密度、突出方章金章仪式感，兼顾出海可读与乐五斋原文保留。

## 契约

| 项 | 口径 |
|---|---|
| 诗文案 | **不变**（目录 `memorialSealDirectory.js` / 三 case 逐字节等价） |
| 双语 | `zh` → 繁体诗主显、EN 辅；`en`/`ja` → EN 主显、繁体诗辅（辅语言小一号、淡色） |
| Blurb | `MUSTARD_SEED_SEAL_CARD_BLURB` 仅 `open({ mode:'auto' })` 可见 |
| 金章 | `yin-badge-square-gold-on-silver-alt.png`；尺寸约 108px + 轻金色光晕 |
| 诗面 | 去掉中文白底内卡；诗直接落在毛玻璃上 |
| 禁止 | 改诗/改印名、Share、成就墙式 UNLOCKED 文案、BottomSheet 大改 |

## 不变量（已好清单）

- 门槛 score ≥ 21、仪式时机、Continue → Reflection 顺序不变
- 三 case 揭示/菜单轮换/持久化键不变
- 方章路径与 tip 圆章分立不变

## 测试

- e2e：`mustard-seed-seal.spec.js`（文案 + blurb 模式 + locale 主辅 class）
- 冒烟：`npm run test:smoke`
- 人工：375 竖屏、auto 仪式见 blurb、菜单重读无 blurb、EN/ZH 切换主辅
