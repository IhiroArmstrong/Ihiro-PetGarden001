# Task Brief · Growth 面板 · 背景 dim（P1 · Slice 2）

> **状态**：**开工**  
> **分支**：`feature/growth-panels-backdrop-dim`  
> **前置**：`task-overlay-backdrop-dim-rollout.md`（排期 SSOT）· Slice 0 `overlayBackdrop` helper 已合  
> **任务线**：`Closes #633`（Zen Cinema / Compass）· `Closes #632`（Yin's Collections）· `Closes #645`（美术优化）  
> **标杆**：Slice 1a Quiet Line · Slice 1b Wallpapers

## 目标

Five Moments Compass、Yin's Collections、Zen Cinema 三张 Idle 二级卡弹出时，场景轻 dim，与纪念印 / Quiet Line / Wallpapers 沉浸感对齐；各卡原有交互不变。

## 契约

| 面板 | 背景 id | testId | outsideDismiss |
|---|---|---|---|
| Compass | `#five-moments-compass-backdrop` | `five-moments-compass-backdrop` | `BLANK_CLOSES` |
| Yin's Collections | `#yin-coin-panel-backdrop` | `yin-coin-panel-backdrop` | `BLANK_CLOSES` |
| Zen Cinema | `#zen-cinema-backdrop` | `zen-cinema-backdrop` | `BLANK_CLOSES` |

| 项 | 口径 |
|---|---|
| 视觉 | `rgba(44, 31, 20, 0.16)` + blur；对齐纪念印 |
| 层级 | backdrop z17；卡 z18 不变 |
| 交互 | 点遮罩关卡；Esc / 关闭钮仍关 |
| 不变 | Compass 首卡 / moment chips；珍藏结缘 / 挥手；Zen Cinema YouTube 外链 |
| 阿寅露脸 | **本切片不做** body class |
| 禁止 | 改 SKU / 影片链接 / Compass 文案 |

## 实现要点

1. **必须**复用 `overlayBackdrop` helper；禁止复制 backdrop CSS。  
2. `open()`：`showOverlayBackdrop`；`close()` / `_dismiss()`：`hideOverlayBackdrop`。  
3. 与 `idleSecondaryPanels` 互斥不变。  
4. 更新 `Z_INDEX.md` 三行。

## 点击反馈（PR 三问）

1. **0–1s**：卡出现同时背景轻 dim；点遮罩或关闭 → 卡 + dim 淡出。  
2. **静默**：无 SB-19（非录入卡）；点空白关 = 设计行为。  
3. **冲突**：对照 Growth 菜单主路径；强度低于 Reflection；**无冲突**。

## 测试

- 单元：`GrowthPanelsBackdropDim.test.js`（三卡 backdrop id / 显隐契约）  
- e2e：`wide-idle-more-menu.spec.js` 补三卡 backdrop + 点遮罩关  
- 冒烟：`npm run test:smoke`  
- 人工：375 不挡三球/主 CTA；珍藏挥手仍可见；Zen Cinema YouTube 钮仍可用

## TEST_TRACKER

见 `docs/tracker-entries/feature-growth-panels-backdrop-dim.md`（实现 PR 时建）。
