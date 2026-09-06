# WEEKLY_PRODUCT_BACKLOG_AUDIT.md — 产品待办每周盘点

创建日期：2026-09-06  
权威路径：`focus-tiger/docs/WEEKLY_PRODUCT_BACKLOG_AUDIT.md`  
性质：**盘点 + 排期决策**——不替代 `ISSUE_LEDGER.md`（闭环追踪）或 `TEST_TRACKER.md`（验收关单）。

---

## 0. 目的

防止「已记录、无异议、却长期未执行」的产品 Bug 修复要求与产品优化要求被遗漏。

与相邻文档的分工：

| 文档 | 答什么 |
|---|---|
| **本文件** | 每周：哪些已记录项仍该开修？哪些其实已合 develop 只待 QA？哪些须 PO 拍板？ |
| `ISSUE_LEDGER.md` | 单条问题的状态机（未跟进 / 跟进中 / 已解决） |
| `TEST_TRACKER.md` | 用户可感知改动的验收行 + release-blocker 逾期 |
| `LOGGED_NOT_FIXED_AUDIT.md` | 明确写「暂不修 / 观察 / Backlog」的 defer 决策是否该重排 |

---

## 1. 触发口令

出现以下任一表述时，Agent **须 Read 本文件全文**并执行 §2 扫描：

- **「产品盘点」** / **「每周盘点」** / **「核对问题清单」**（与 `ISSUE_LEDGER` 口令同效，但输出须含本文件 §4 分层）
- 用户约定周期：**每周一次**（默认周一；无固定 cron，由用户或 Agent 在会话中触发）

---

## 2. 扫描顺序（强制）

1. **`ISSUE_LEDGER.md`** — 所有非「已解决」条目  
2. **`TEST_TRACKER.md`** — 状态「有问题」+ 严重度 `release-blocker` 且处理承诺非「已关单 / post-v1 降级」  
3. **`LOGGED_NOT_FIXED_AUDIT.md` §1 主表** — 总分 ≥9 或标注「需要人工判断」且用户近期未重申 defer  
4. **（可选）`PROCESS.md` Backlog「仍待办」** — 已拍板排队、无运行时

每条须归类为 §3 四桶之一；**禁止**只报 ISSUE_LEDGER 而漏 TRACKER blocker。

---

## 3. 四桶分类与动作

| 桶 | 含义 | 本盘点回合动作 |
|---|---|---|
| **A · 立刻开修** | 已记录、无异议、改动面小、无未决产品决策 | 本回合或下一 `fix/*` 分支实现 + 单测/冒烟 |
| **B · 已合 develop · 待人工关单** | 代码已合 tip，ISSUE_LEDGER 仍写跟进中 | **禁止**重复开修；更新 ledger 为「代码已合 develop tip `<hash>` · 待 TRACKER 关单」；列入批量人工测试 |
| **C · 须 PO / 分析师拍板** | Brief 未开、方向锁、Gate 0.D 否决项、LOGGED 高分 defer | 只列出选项 + 「我认为最合理的」；不开代码 |
| **D · 观察 / 暂不修** | LOGGED ≤5、EDGE_CASES P2、已放弃功能 | 确认仍 defer；不进 A |

---

## 4. 第 1 次盘点快照（2026-09-06）

基线：`origin/develop` tip **`981628b0`**（盘点日 fetch 后）。

### 4.1 A · 立刻开修（本回合已执行 / 下一 fix 批）

| # | 问题 | 出处 | 动作 |
|---|---|---|---|
| A1 | 宽屏 `#confide-ear-chrome` 与 `#focus-hud` 重叠 | ISSUE_LEDGER · TRACKER 倾听耳行 · SANCTUARY B 表 | **本回合 `fix/weekly-audit-confide-ear-hud`**：耳钮下移至 HUD 下方（+112px） |
| A2 | ~~Arrival 鞠躬→Idle 闪白~~ | — | **已移入 B 桶**（#150 `clear:false` + #386 鞠躬回落 1s 叠化已在 develop）；下一批 **TRACKER 人工关单**，禁止重复开修 |
| A3 | Reflection 末题共鸣「来不及看就关」 | TRACKER RB-20260822 | 分支 `fix/reflection-last-echo-hold` 待核是否已合 tip |

### 4.2 B · 已合 develop · 待人工关单（禁止重复开修）

| # | 问题 | 合入锚 | ISSUE_LEDGER 待更正 |
|---|---|---|---|
| B1 | ⋯ Quiet Line / Wallpapers 点开即闪没 | PR **#533** `40f68313` | 行 7：改「代码已合 · 待 TRACKER L336 关单」 |
| B2 | Confide L2 复读 / fallback 连打 | PR **#561** + 属性锁 | 行 11：保持跟进中，注明 tip 复测 ≥12 句 |
| B3 | Confide 暴力句点头 | PR **#566** aggression 池 | 行 12：代码已合 · 待人工 + 语料审定 |
| B4 | Confide `still.` / `Still watching.` 空话 | PR **#567** hollow observe | 行 13：代码已合 · 待 Electron 复测 |
| B5 | Electron Support 结账回本壳 | PR **#530** | 行 5：代码已合 · 待 TRACKER L335 关单 |
| B6 | Journey 时长 / 空态 / EN 寅币等叠层穿透 | 多 PR 2026-09-02 批 | 行 8–10：已解决 ✓（ledger 已准） |
| B7 | L3 山水式答句 | PR **#505** | 行 18：仍 fail 空话/茶句马甲 → 保持跟进中，非重复开 #505 |
| B8 | Arrival CapCut 抗闪全链（§6.15） | PR **#150** + **#386** · develop tip `ef80d3cb` | **禁止**再开 `fix/arrival-capcut-clear-false`；下一批 develop tip **人工验收关单**（`?tasteLayer=0` 对照 + 分列三条） |

### 4.3 C · 须拍板（本盘点不开修）

| # | 问题 | 出处 | 建议 |
|---|---|---|---|
| C1 | 「你观察到我什么」≠ OTHER 查询 | ISSUE_LEDGER 行 22 | **#587 已 ship** · C1 待 Electron 关单 · **C2 审计已产出**（`confide-observation-honesty-bucket-audit.md`）· CI-04/05/06 待 PO 拍板 |
| C2 | Confide 多语言 Personal Memory 抽取 | ISSUE_LEDGER 行 17 | **PO 已拍板（2026-09-06）**：语言无关须入库；撤销 V1 中文排除 → **下一批 Brief** |
| C3 | Gate 0.D 语用残差（A14/A15/D7 等） | ISSUE_LEDGER 行 20–21 | PO 已否决 Phase 3 → 保持探针/L3 残差，不另开生产单 |
| C4 | Hints 整体再设计 + viewport-context 解耦 | LOGGED #2 · Backlog ⑤ | **Brief 已开**：`task-hints-redesign-phase2.md` + `task-hints-whisper-boundary-audit.md`；实现口令「开工 Hints viewport-context 试点」 |
| C5 | ~~主动 Recover 入口~~ | LOGGED #6 | **已移出 C 桶**：Tiger Anchor 已落地（2026-08-09）→ B/D · TRACKER 待 QA |
| C6 | SessionComplete 观察式文案 | LOGGED #5 | 先看原文措辞再定是否改 |

### 4.4 D · 继续观察（本盘点不动）

LOGGED #21–30、EyeTracking 已放弃、IncenseComplete 未接线、Cloud v1.1 延后等 — 见 `LOGGED_NOT_FIXED_AUDIT.md` §2 统计。

---

## 5. 每周例行（建议节奏）

| 步骤 | 负责人 | 产出 |
|---|---|---|
| 1. 触发口令「产品盘点」 | 用户或 Agent（每周一建议） | §4 格式新快照，日期 + develop tip |
| 2. 扫四源（§2） | Agent | 四桶表；A 桶 ≤3 条/周（防分支泛滥） |
| 3. 执行 A 桶合理项 | Agent | `fix/*` + 单测；更新 ISSUE_LEDGER |
| 4. B 桶对齐 ledger | Agent | 禁止假「已解决」；同步 TRACKER 待测 |
| 5. C 桶汇报 | Agent | N14「待你决定」列选项 + 最合理项 |
| 6. 批量人工测试（可选） | 用户 | TRACKER 关单；再回写 ISSUE_LEDGER「已解决」 |

**硬规则**（`DEV_WORKFLOW_QUALITY` §6.23）：ISSUE_LEDGER「已解决」不得早于 TRACKER 人工关单。

---

## 6. 索引与规则挂钩

| 索引 topicId | SSOT |
|---|---|
| `weekly-product-audit` | 本文件 |
| `issue-ledger` | `ISSUE_LEDGER.md` + `.cursor/rules/focus-tiger-issue-ledger.mdc` |
| `release-blocker-ledger` | `TEST_TRACKER.md` 缺陷分级节 |

口令「核对问题清单」= 输出 ISSUE_LEDGER 全部非已解决 **+** 本文件 §4 最新快照摘要（若超过 7 天则重扫）。

---

## 7. 变更记录

| 日期 | 说明 |
|---|---|
| 2026-09-06 | 首版：第 1 次盘点 + 机制；同步修 A1 倾听耳 HUD 重叠 |
