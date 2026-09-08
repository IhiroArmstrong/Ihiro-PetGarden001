# Task Brief · Quiet Line · 背景 dim（P0 · Slice 1a）

> **状态**：**Slice 1a 开工**（`feature/quiet-line-backdrop-dim`）
> **分支**：`feature/quiet-line-backdrop-dim`  
> **前置**：`task-overlay-backdrop-dim-rollout.md`（排期 SSOT）· 建议先合 Slice 0 `overlayBackdrop` helper  
> **任务线**：`Closes #637`（金句库/三池）· `Closes #645`（美术优化）  
> **标杆**：`MustardSeedSealCardUI` Phase B（#614）

## 目标

今日静语卡（`#daily-zen-quote-card`）弹出时，场景轻 dim，与纪念印 Phase B 沉浸感对齐；Save image / Not now 行为不变。

## 契约

| 项 | 口径 |
|---|---|
| 背景 | `#daily-zen-quote-backdrop`（或 helper 生成）；z17；卡 z18 不变 |
| 视觉 | `rgba(44, 31, 20, 0.16)` + blur；对齐纪念印 |
| 交互 | 点遮罩关卡（`BLANK_CLOSES`）；Esc / Not now 仍关 |
| 不变 | 当日金句、静帧底图、Save image PNG、同日锁、overlay 仲裁 |
| 阿寅露脸 | **本切片不做** body class（卡不裁脸则不加）；后续按需 |
| 禁止 | 改金句池、改明信片布局、一键社交分享 |

## 实现要点

1. 优先复用 Slice 0 `overlayBackdrop`；若 helper 未合，可复制 `MustardSeedSealCardUI` backdrop 生命周期。  
2. `open()`：显 backdrop → `is-visible`；`close()` 对称。  
3. 与 `idleSecondaryPanels` 互斥不变；开 Quiet Line 仍关其它 growth 卡。  
4. 更新 `Z_INDEX.md` 一行。

## 点击反馈（PR 三问）

1. **0–1s**：卡出现同时背景轻 dim；点遮罩或 Not now → 卡 + dim 淡出。  
2. **静默**：无 SB-19（非录入卡）；点空白关 = 设计行为。  
3. **冲突**：对照 Quiet Line 场景；强度低于 Reflection；**无冲突**。

## 测试

- 单元：backdrop 显隐 / pointer 契约（若 helper 已有则扩覆盖）  
- e2e：`daily-zen-quote` 或同类 spec 补 `#daily-zen-quote-backdrop` + 点遮罩关  
- 冒烟：`npm run test:smoke`  
- 人工：375 不挡三球；Save image 仍下载；同日再开句不变

## TEST_TRACKER

见 `docs/tracker-entries/feature-quiet-line-backdrop-dim.md`（实现 PR 时建）。
