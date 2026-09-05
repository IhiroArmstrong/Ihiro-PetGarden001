# Task Brief · Hints 整体再设计 Phase 2（LOGGED #2 + viewport-context 解耦）

> **状态（2026-09-06）**：**Brief 已开 · 不写代码**（PO 拍板：合理则下一批办理；**不与尖角热修混批**）。  
> **来源**：`LOGGED_NOT_FIXED_AUDIT.md` #2 · `HINTS_WIRING.md` §八 ⑤ · `WEEKLY_PRODUCT_BACKLOG_AUDIT.md` C4 · `PROCESS.md` Backlog ⑤。  
> **姊妹 Brief**：`task-hints-whisper-boundary-audit.md`（Whisper / Hints / ? 分轨 gap 清单；同口令可并行读，实现仍一次一任务）。

---

## 一句话目标

把 Hints 从「尖角/park 单点热修」升级为**可执行的产品再设计 + 架构试点**：明确收窄后的产品面是否够用、哪些 hintId 仍该存在、以及 **viewport-context 解耦**（锚点判断少直接摸 Session chrome / 窄宽壳状态）的第一刀范围——**观感关单仍以 TEST_TRACKER 人工为准**，视觉护栏试点（PR #93）≠ 本 Brief 关单。

---

## 背景（为何不是尖角热修）

| 现象 | 根因层级 | 本 Brief 是否覆盖 |
|---|---|---|
| weekly-heatmap tip 尖角偏、藏进 More tips | 产品契约 + 几何 | ✅ 再设计决策 |
| ? 补救喷洒已取消，但历史 e2e/文档仍混口径 | 产品面收窄（2026-08-04） | ✅ 统一验收口径 |
| 改字体/z-index/窄宽 remap → mint 褪奶油 | 机械回归 | ❌ 已有 #93 护栏；扩面另口令 |
| hint 锚点直接读 `main.js` / 窄壳 suppress | 架构耦合（⑤） | ✅ 试点范围 |

**禁止**：在本 Brief 未拍板前，以「修尖角」名义改 `OnboardingHintsUI` 大文件或恢复 auto spray / help-remedy 芯片。

---

## 已好清单（不变量）

1. **产品面（2026-08-04 收窄版）**：运行时只保留 **(a) 薄荷绿脉冲悬停 tip**（含 Focus HUD 无脉冲但悬停出 tip 的例外）与 **(b) ? 只出产品简介**；禁止 ? 喷本页 tips / More tips 芯片。  
2. **Mint 色**：`#6db3a0`（音符 `has-hint-mint::after`）；tip 气泡薄荷绿渐变（`#eef6f1` → `#dceae2`），**不是**奶油帮 `?` 的 `#fff8ec`。  
3. **Whisper / Compass / Journey** 与 Hint registry **分轨**（`ONBOARDING_HINTS.md` · `task-five-moments-surface-plan.md`）。  
4. **冷启动额头句** `IDLE_YIN_TAP_HINT`：一生一次，不是 mint 脉冲喷洒回归。  
5. **既有 e2e 契约**：`onboarding-remedy-contract`（历史存档口径）、`wide-idle-more-menu`、`hints-visual-guardrail` 仍绿；本再设计**不得**静默删测。  
6. **人工观感关单权威**：TEST_TRACKER「? 补救」行已废契约；新验收以本 Brief 产出表为准。

## 保护面

- Idle / Sit / Arrival / Honesty / Focusing / Rise 序列观感  
- Five Moments Whisper（`#moment-whisper`）叠层互斥  
- 窄屏 ActionBar + 抽屉 + 三主钮 suppress 契约  
- Companion Mode / Focus HUD / weekly heatmap 邻接 chrome

---

## Phase 2 交付物（本 Brief 只做文档决策）

### A. 产品再设计决策表（须 PO 书面确认后方能开工）

| 决策项 | 选项（草案） | 备注 |
|---|---|---|
| weekly-heatmap tip | 保留脉冲 / 并入 ? Compass 链 / 删除独立 tip | KnownRisky #5 步5 已失败；勿单点硬修 |
| 窄屏 Sit options / How 脉冲 | 维持延期 vs 纳入再设计 | LOGGED #15 已并入 #2 |
| Focus HUD 三控件 | 保持无脉冲 + 悬停 tip | 2026-08-15 拍板 |
| `help-affordance` | 保持只出 purpose；Privacy 链不动 | 与 Whisper 边界见姊妹 Brief |
| 已废 `help-remedy` / catalog 芯片 | 代码死路径是否删 vs 留注释 | 删代码须单独小 PR + 回归 |

### B. viewport-context 解耦试点（⑤ 第一刀）

**目标**：hint 锚点计算改为吃 **显式 viewport-context**（宽/窄、overlay busy、postSession、Arrival open…），而非在 `OnboardingHintsUI` 内 scattered 读全局壳状态。

| 试点 hint 簇（建议） | 理由 |
|---|---|
| `weekly-heatmap` + 左下 ? 邻接 | 尖角回归高发；几何与壳层强相关 |
| `focus-hud-*` 三控件 | 无脉冲但 `pulse-owns-tip` 去重复杂 |
| 宽屏 `wide-more-menu` park | 与三球 / Honesty dock 互斥 |

**试点不做**：全 registry 一次迁移；Chromatic；改产品运行时行为（先抽 context 再接线）。

### C. 验收口径（写入 TEST_TRACKER 前须本表定稿）

- **主路径**：`?product=1` 宽屏 + 375 各至少一条「脉冲悬停 → tip 可读 → 移开即收」。  
- **? 路径**：只出 purpose；可进 Compass；**不得**喷本页 tips。  
- **viewport-context 试点**：改壳层 suppress 时，试点簇 tip 锚点 **不漂到虚空**（e2e 几何或人工分列）。  
- **回流**：Rise 后再进 Idle；Focusing 期间 HUD tip 行为与改前契约一致。

---

## 实现顺序（拍板后）

| 序 | 任务 | 分支建议 | 禁止同 PR |
|---|---|---|---|
| 1 | viewport-context 类型 + 只读 derive（无 UI 变） | `feature/hints-viewport-context-slice0` | 尖角像素热修 |
| 2 | 试点簇接线 + 单测/e2e | `feature/hints-viewport-context-pilot` | Whisper 文案大改 |
| 3 | 产品再设计项（按决策表） | `feature/hints-redesign-phase2-*` | 全 registry 重写 |

**口令**：「开工 Hints viewport-context 试点」→ 序 1–2；「开工 Hints 再设计 \<子项\>」→ 序 3 分项。

---

## 冲突扫描

| 轴 | 对照 | 判断 |
|---|---|---|
| **强度** | Arrival / Honesty 叠化窗口 | 再设计不得加阻塞 Banner；脉冲仍非模态 |
| **人设** | `EMOTION_BIBLE` 观察式 | tip 文案仍禁教练腔 |
| **职责** | Whisper / Compass / Confide | Hints ≠ Moment 教导；不借再设计恢复喷洒 |

**无冲突**（文档阶段）；实现时逐子项再扫。

---

## ❌ 本 Brief 明确不做

- 尖角单点热修 PR（除非 PO 书面豁免并标明「紧急热修，不进再设计」）  
- 恢复 ? 补救喷洒 / More tips 芯片  
- 扩 #93 视觉护栏到全 hintId（仍观察中）  
- 与 Personal Memory / Confide L3 同批  
- 宣称「有 Brief = 已修好」

---

## 文档义务（Brief 合入时）

- `HINTS_WIRING.md` §八 ⑤ 链本 Brief  
- `LOGGED_NOT_FIXED_AUDIT.md` #2 建议列更新  
- `ONBOARDING_HINTS.md` 指针（不重写全文）  
- `TEST_TRACKER` 新行或更新「Onboarding Hints」族（状态仍「待人工测试」直至关单）
