# Task Brief · 宽屏首页三球统一（窄屏 ActionBar 三球迁到宽屏首页）

**日期**：2026-07-30  
**状态**：待开工（Brief 已立 · 本轮**不**实现代码）  
**角色**：UI Engineer  
**权威**：`RESPONSIVE_LAYOUT.md` · `SHARED_RESOURCES.md` Idle chrome · Task 3 `task-responsive-single-chrome-line.md` · 用户 2026-07-30 拍板  
**依赖**：建议在 `fix/onboarding-remedy-contract-and-wide-idle-menu`（PR #43）合入后再开，避免与 `?` / ⋯ / mint 契约叠改。

---

## 一句话目标

宽屏（≥480）Idle **首页**采用与窄屏一致的「三球」主入口形态，**代替**当前宽屏底栏相关主按钮布局；三球必须出现在宽屏首页，且与窄屏功能对等（Sit / Quick Start / Honesty 等现行职责以产品拍板为准）。

---

## 背景

用户书面（2026-07-30）：「窄屏幕的三个球的按钮希望统一到宽屏幕，代替宽屏幕的相关按钮，而且宽屏幕的首页也需要这三个按钮。」并确认另开任务、本轮不实现。

当前：窄 = ActionBar + 画布三球 + 抽屉；宽 = Sit+⚡+⋯。Task 3 已收编排单线，但**呈现**仍是两套主 CTA 形态。

---

## 已好清单（开工不变量）

1. 断点语义：`≥480` 仍是宽壳，不得误切成窄抽屉壳。  
2. `⋯` / 抽屉二次入口列表契约（Honesty / breath / companion / reminder / language）不丢。  
3. 音符仅右上（菜单无 Sound 行）；mint / hover / 选曲清点契约保持（见 PR #43）。  
4. `?` 补救：本页**可见**锚点立刻出 tip（含 weekly chart）。  
5. Sit → Arrival → Companion → Rise 门闩与回流不变。

---

## 范围

**做**：宽屏 Idle 首页三球布局与窄屏职责对齐；必要 CSS / 壳投影；e2e + TEST_TRACKER。  
**不做**：重做 Task 3 编排层；纪念奖励 / 3D；改情绪序列。

---

## 验收（关单级仍只认 `origin/develop` tip）

1. 宽屏首页见三球，且可完成 Sit / Quick / Honesty（或拍板后的等价职责）。  
2. 375 三球 + 抽屉不回退。  
3. 断点 375↔480 无双壳叠点。  
4. 自动化至少锁：宽屏三球可见 + 一点选主路径。

---

## 建议分支

`feature/wide-home-three-ball` · 独立 worktree `…-wt-wide-three-ball` · 基线 `origin/develop`（含 PR #43 后 tip）。
