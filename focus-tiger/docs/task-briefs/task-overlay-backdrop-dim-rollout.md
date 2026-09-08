# Task Brief · 前景卡背景 dim 推广 · 总排期 SSOT

> **状态**：**排期已拍板**（2026-09-08）  
> **标杆**：`task-mustard-seed-seal-ui-phase-b.md`（#614 已合 develop）  
> **任务线**：`Relates to #645`（美术优化）· Quiet Line 切片另 `Relates to #637` · 付费卡族另 `Relates to #630`

## 目标

纪念印 Phase B 的「前景卡 + 全屏浅 dim + blur」体验值得推广到同类 Idle 二级面板；会话主路径（Arrival / Reflection 等）**永久排除** dim。

## 拍板（2026-09-08）

| 项 | 决定 |
|---|---|
| 顺序 | **P0 → P1**；先做 Quiet Line + Wallpapers，再付费卡族 |
| 会话流程 | Arrival / Honesty / 微仪式 / Reflection / Ritual / Companion / 时长选择 → **不做**全屏 dim |
| SB-19 | 录入卡（Tea / Newsletter / Confide / Sanctuary / Membership restore）→ dim **仅视觉**；遮罩 `pointer-events: none` 或不可点关 |
| 共享基建 | Slice 0 抽 `overlayBackdrop` helper，对齐纪念印数值 |
| PR 纪律 | 开向 develop 的 PR **必须** `Relates to #NNN`（Epic）或 `Closes #NNN`（审计/切片）；**禁止**对 Epic 用 `Closes` |

## 已有 dim（不必重做）

| 场景 | 遮罩 | z |
|---|---|---|
| 芥子须弥纪念印 | `#mustard-seed-seal-backdrop` | 17 / 卡 18 |
| Journey Log | `.journey-log-backdrop` | 31 / 卡 32 |
| Support Yin 模态 | `#yin-support-backdrop` | 25 / 模态 26 |
| Yin Membership | `#yin-membership-backdrop` | 17 / 卡 18 |
| 「?」简介（**点击钉住**） | `#onboarding-app-purpose-backdrop` | 26 / 卡 27 |
| Privacy Sheet | 复用 purpose backdrop | 同上 |
| 宽屏 ⋯ sheet | `#ft-wide-more-backdrop` | 25 |
| 窄屏抽屉 | `.ft-narrow-sheet-backdrop` | 壳内 |

## 缺失 dim · 排期表

### P0 — 导出同族（下一刀）

| 顺序 | 面板 | DOM id | Brief | Epic | outsideDismiss |
|---|---|---|---|---|---|
| **1a** | 今日静语 Quiet Line | `#daily-zen-quote-card` | `task-quiet-line-backdrop-dim.md` | #637 + #645 | `BLANK_CLOSES` |
| **1b** | 阿寅静帧壁纸 | `#digital-wallpapers-card` | `task-wallpapers-backdrop-dim.md` | #645 | `BLANK_CLOSES` |

### P1 — Growth / 付费

| 面板 | DOM id | Brief | Epic | outsideDismiss |
|---|---|---|---|---|
| Five Moments Compass | `#five-moments-compass` | 待建 | #633 | `BLANK_CLOSES` |
| Yin's Collections | `#yin-coin-panel` | 待建 | #632 | `BLANK_CLOSES` |
| Zen Cinema | `#zen-cinema-card` | 待建 | #633 | `BLANK_CLOSES` |
| Sanctuary Lifetime | `#yin-sanctuary-card` | 待建 | #630 | `SB19_HOLD` · 视觉-only dim |
| Buy Yin a Tea | `#yin-tip-jar-card` | 待建 | #630 | `SB19_HOLD` |
| Stay in touch | `#newsletter-capture-card` | 待建 | #630 | `SB19_HOLD` |
| Confide to Yin | `#confide-to-yin-card` | 待建 | #639 | `SB19_HOLD` |
| Language 偏好 | `#language-preference` | 待评估 | #641 | 锚定 FAB；轻 dim 或局部 |

### P2 — 可选

Presence Signals / Quiet Together / Focus Circle / Local Practice Data 子面板；Wellness QA 卡。

## 永久排除（轻量观照 · 非 modal 墙）

| 类型 | 代表 |
|---|---|
| 会话主路径 | Arrival · Honesty · 微仪式 · Reflection · Ritual Flow · Companion · Focus 时长 |
| 瞬时认出 | Moment Whisper · Focus Awareness · 变花 Welcome · 请茶气泡 · 节日 whisper |
| Chrome | Reminder 横幅 · Soundscape 曲目 · Immersive Presence |
| ? 悬停预览 | 邻接简介卡（**悬停无** backdrop；仅点击钉住有） |

## 技术契约（推广时统一）

| 项 | 口径 |
|---|---|
| 视觉 | `rgba(44, 31, 20, 0.16)` + `backdrop-filter: blur(8px)`（对齐纪念印） |
| 层级 | 默认 backdrop z = 卡 z − 1（17/18）；Journey Log 例外 31/32 |
| 动画 | `FADE_MS = 220`；`is-visible` 切换 opacity |
| 点遮罩 | `BLANK_CLOSES` 族可关；`SB19_HOLD` 族不可关 |
| Yin 露脸 | 仅纪念印必需；Quiet Line / Wallpapers **按需**（卡裁脸时再加 body class） |
| z-index | 合入前更新 `Z_INDEX.md` |

## 切片顺序（一次一任务）

```
Slice 0  overlayBackdrop helper + 单测          → feature/overlay-backdrop-helper
Slice 1a Quiet Line dim                         → feature/quiet-line-backdrop-dim
Slice 1b Wallpapers dim                         → feature/wallpapers-backdrop-dim
Slice 2  Compass + Yin Coin + Zen Cinema        → 待口令
Slice 3  付费族 SB-19 视觉-only dim             → 待口令
```

## 冲突扫描（2026-09-08）

| 轴 | 结论 |
|---|---|
| 强度 | 轻 dim 不挡主 CTA；与 whisper 气泡族无冲突 |
| 语气 | 沉浸不推销；与付费卡文案无冲突 |
| 职责 | 仅 UI 层；不改 overlay 仲裁语义；**无冲突** |
