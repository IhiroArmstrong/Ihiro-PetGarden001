# Task Brief · Wallpapers · 背景 dim（P0 · Slice 1b）

> **状态**：**待开工**  
> **分支**：`feature/wallpapers-backdrop-dim`  
> **前置**：`task-overlay-backdrop-dim-rollout.md`（排期 SSOT）· **须先合** Slice 0 `overlayBackdrop` helper  
> **任务线**：`Closes #645`（美术优化）  
> **标杆**：`MustardSeedSealCardUI` Phase B（#614）· 姊妹切片 `task-quiet-line-backdrop-dim.md`（Slice 1a）

## 目标

阿寅静帧壁纸卡（`#digital-wallpapers-card`）弹出时，场景轻 dim，与纪念印 / Quiet Line 沉浸感对齐；缩略图网格、点选、Save image 行为不变。

## 契约

| 项 | 口径 |
|---|---|
| 背景 | `#digital-wallpapers-backdrop`（或 helper 生成）；z17；卡 z18 不变 |
| 视觉 | `rgba(44, 31, 20, 0.16)` + blur；对齐纪念印 |
| 交互 | 点遮罩关卡（`BLANK_CLOSES`）；Esc / Not now 仍关 |
| 不变 | 5 张策展静帧、选中态、Save image PNG、overlay 仲裁、growth 菜单互斥 |
| 阿寅露脸 | **本切片不做** body class（卡不裁脸则不加）；后续按需 |
| 禁止 | 改策展清单、改付费门槛（仍免费）、一键社交分享 |

## 实现要点

1. **必须**复用 Slice 0 `overlayBackdrop`（`src/ui/overlayBackdrop.js`）；禁止再复制 `MustardSeedSealCardUI` backdrop 块。  
2. `open()`：显 backdrop → `is-visible`；`close()` 对称（`hideOverlayBackdrop` + FADE_MS）。  
3. 与 `idleSecondaryPanels` 互斥不变；开 Wallpapers 仍关其它 growth 卡。  
4. 更新 `Z_INDEX.md` 一行（backdrop z17）。

## 点击反馈（PR 三问）

1. **0–1s**：卡出现同时背景轻 dim；点遮罩或 Not now → 卡 + dim 淡出。  
2. **静默**：无 SB-19（非录入卡）；点空白关 = 设计行为。  
3. **冲突**：对照 SCENARIO_TESTS Wallpapers 主路径；强度低于 Reflection；**无冲突**。

## 测试

- 单元：扩 `overlayBackdrop.test.js` 或 Wallpapers UI 契约（backdrop id / dismiss 模式）  
- e2e：Wallpapers spec 补 `#digital-wallpapers-backdrop` + 点遮罩关  
- 冒烟：`npm run test:smoke`  
- 人工：375 不挡主球；Save image 仍下载 `focus-tiger-wallpaper-*.png`；关卡后再开菜单仍可选中缩略图

## TEST_TRACKER

见 `docs/tracker-entries/feature-wallpapers-backdrop-dim.md`（实现 PR 时建）。
