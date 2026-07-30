# Task Brief · 宽屏首页三球统一（窄屏 ActionBar 三球迁到宽屏首页）

**日期**：2026-07-30  
**状态**：**产品已拍板（2026-07-31）** · 待开工实现（本轮只锁口径，**不**改运行时）  
**角色**：UI Engineer  
**权威**：`RESPONSIVE_LAYOUT.md` · `SHARED_RESOURCES.md` Idle chrome · Task 3 `task-responsive-single-chrome-line.md` · 用户 2026-07-30 书面 + **2026-07-31 同意「宽屏首页也用三球」**  
**依赖**：`fix/onboarding-remedy-contract-and-wide-idle-menu`（PR #43）已合；基线 `origin/develop` tip（含 PR #48）。

---

## 一句话目标

宽屏（≥480）Idle **首页**采用与窄屏一致的「三球」主入口形态，**代替**当前宽屏底栏 **Sit + ⚡** 文案 pill 主 CTA；三球必须出现在宽屏首页，且与窄屏功能对等（顺序与职责：**Quick Start · Sit with Yin · Honesty**）。次要入口仍走 **⋯**（呼吸 / How / Reminder / language 等现行列表），不把三主钮塞进 ⋯。

---

## 背景

用户书面（2026-07-30）：「窄屏幕的三个球的按钮希望统一到宽屏幕，代替宽屏幕的相关按钮，而且宽屏幕的首页也需要这三个按钮。」并确认另开任务、当时本轮不实现。  
**2026-07-31**：用户书面确认 **同意「宽屏首页也用三球」** → 产品口径锁定；实现另开 `feature/wide-home-three-ball`。

当前运行时：窄 = ActionBar + 画布三球 + 抽屉；宽 = Sit+⚡+⋯。Task 3 已收编排单线，但**呈现**仍是两套主 CTA 形态——本 Task 改宽屏呈现。

---

## 已好清单（开工不变量）

1. 断点语义：`≥480` 仍是宽壳，不得误切成窄抽屉壳。  
2. `⋯` / 抽屉二次入口列表契约（breath / companion / reminder / language 等）不丢；**Honesty 主入口迁到宽屏三球后**，⋯ 内 Honesty 行按编排与窄屏抽屉对等（禁止双入口叠点）。  
3. 音符仅右上（菜单无 Sound 行）；mint / hover / 选曲清点契约保持（见 PR #43）。  
4. `?` 补救：本页**可见**锚点立刻出 tip（含 weekly chart）。  
5. Sit → Arrival → Companion → Rise 门闩与回流不变。  
6. 375 三球 + 抽屉观感/e2e **不回退**。

---

## 范围

**做**：宽屏 Idle 首页三球布局与窄屏职责对齐；必要 CSS / 壳投影；e2e + TEST_TRACKER；同步改 `DEV_WORKFLOW_QUALITY` §9 W1 目标壳描述（Sit+⚡+⋯ → 三球+⋯）。  
**不做**：重做 Task 3 编排层；纪念奖励 / 3D；改情绪序列。

---

## 验收（关单级仍只认 `origin/develop` tip）

1. 宽屏首页见三球，且可完成 Sit / Quick / Honesty。  
2. 375 三球 + 抽屉不回退。  
3. 断点 375↔480 无双壳叠点。  
4. 自动化至少锁：宽屏三球可见 + 一点选主路径。  
5. §9 故事最小集按**新**目标壳复测（实现回合改表）。

---

## 建议分支

`feature/wide-home-three-ball` · 独立 worktree `…-wt-wide-three-ball` · 基线 `origin/develop` tip。
