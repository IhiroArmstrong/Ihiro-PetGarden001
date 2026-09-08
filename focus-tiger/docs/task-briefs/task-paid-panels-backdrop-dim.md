# Task Brief · 付费族 SB-19 视觉-only dim（P1 · Slice 3）

> **状态**：**开工**  
> **分支**：`feature/paid-panels-backdrop-dim`  
> **前置**：`task-overlay-backdrop-dim-rollout.md`（排期 SSOT）· Slice 0 `overlayBackdrop` helper 已合 · Slice 2 已合 #660  
> **任务线**：`Closes #630`（付费卡族 dim）· `Closes #639`（Confide）· `Closes #645`（美术优化）  
> **标杆**：Slice 1a Quiet Line · Slice 2 Growth 面板

## 目标

Stay in touch、Confide、Buy Yin a Tea、Sanctuary Lifetime 四张 SB-19 录入/付费卡弹出时，场景轻 dim，与纪念印 / Quiet Line 沉浸感对齐；**点遮罩不关卡**（SB-19），Cancel / Close / Esc 仍关。

## 契约

| 面板 | 背景 id | testId | outsideDismiss | backdrop z |
|---|---|---|---|---|
| Stay in touch | `#newsletter-capture-backdrop` | `newsletter-capture-backdrop` | `SB19_HOLD` | 17 |
| Confide to Yin | `#confide-to-yin-backdrop` | `confide-to-yin-backdrop` | `SB19_HOLD` | 17 |
| Buy Yin a Tea | `#yin-tip-jar-backdrop` | `yin-tip-jar-backdrop` | `SB19_HOLD` | 17 |
| Sanctuary Lifetime | `#yin-sanctuary-backdrop` | `yin-sanctuary-backdrop` | `SB19_HOLD` | 26（卡 z27） |

| 项 | 口径 |
|---|---|
| 视觉 | `rgba(44, 31, 20, 0.16)` + blur；对齐纪念印 |
| 交互 | **遮罩 `pointer-events: none`**；点空白**不关**（SB-19） |
| 不变 | Cancel / Close / Esc；录入草稿；Checkout / OTP 流程 |
| 阿寅露脸 | **本切片不做** body class |
| 不含 | Yin Membership（已有 `#yin-membership-backdrop`） |

## 实现要点

1. **必须**复用 `overlayBackdrop` helper + `SB19_HOLD`；禁止复制 backdrop CSS。  
2. `open()`：`showOverlayBackdrop`；`close()`：`hideOverlayBackdrop`。  
3. 与 `idleSecondaryPanels` / overlay registry 互斥不变。  
4. 更新 `Z_INDEX.md` 四行。

## 点击反馈（PR 三问）

1. **0–1s**：卡出现同时背景轻 dim；点遮罩**不关**；Cancel / Close / Esc → 卡 + dim 淡出。  
2. **静默**：**SB-19** — 点卡外空白 / 遮罩，卡仍开着、字还在。  
3. **冲突**：对照录入叠层 / Confide 主路径；强度低于 Reflection；**无冲突**。

## 测试

- 单元：`PaidPanelsBackdropDim.test.js`（四卡 backdrop id / SB19 点遮罩不关）  
- 冒烟：`npm run test:smoke`  
- 人工：375 不挡三球/主 CTA；录入中点空白不关；Confide Cancel 仍可用

## TEST_TRACKER

见 `docs/tracker-entries/feature-paid-panels-backdrop-dim.md`（实现 PR 时建）。
