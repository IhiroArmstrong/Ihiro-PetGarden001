# Task Brief · Confide 元观察问句 · 诚实空态 MVP（C1）

> **状态（2026-09-06）**：**A 轨已开工** · B 轨 residual fixture 同 PR（`feature/c1-observation-honesty-and-2b-probe`）。  
> **用户场景**：Kelly · Allow 记忆后问 `What have you noticed about me?` / `I wonder what patterns you've picked up on.`  
> **PO 已拍板（2026-09-06）**：生产 send **不加** 7-way / L0 新分类器；**允许** regex + 模板诚实空态（同 `preference_honesty` 管道，**不算**分类器）。

---

## 结论（本回合 · 无技术拦路虎）

| 轨道 | 目的 | 挡现网修吗？ | 状态 |
|---|---|---|---|
| **A · 诚实空态 MVP** | 元观察句 **0–1s** 模板回复，**禁止** L3 编造模式 | **否** | **可立刻开工**（口令下） |
| **B · Phase 2B B9/B10 探针** | 实验室测 1.7B 能否标 `OBSERVATION_META` vs `OTHER` | **否** | **可选背景**；金标已排除，2B Metal 已结案 |

**PO「生产 send 不动」** = 不把 E′ / 7-way JSON 分类器接到 Share；**不等于**禁止 `preference_honesty` 式 regex 模板。

**与 L3 接住关单**：**无关**。本管道在 L3 之前短路，不经过 `companion.generate`。

**与 Yin Memory 多语言**：**无关**。元观察诚实句不读抽取管道。

---

## 做什么（MVP · 一 PR）

### 1. 新管道 `observation_honesty`（抄 `confidePreferenceHonesty.js`）

- **匹配**（`fallback` 路由 · 正则，可扩 i18n）：
  - `What have you noticed about me?`
  - `I wonder what patterns you've picked up on.`
  - `What have you noticed lately?`（与 Phase 1B 负例同族）
  - 近义：`patterns you've picked up` · `what you've noticed about me`
- **负例仍走原路由**：
  - `How has my mood been?` → `presence_facts`
  - `Have I been showing up consistently?` → `practice_facts`
  - `Show me what you remember` → `memory_list`
- **接线**：`ConfideToYinUI._onSend` 在 `preference_honesty` 之后、`matchConfideExecutableTool` 之前；`data-source=observation_honesty`。
- **禁止**：L3 generate；假装有模式总结；读 `turns.jsonl` 扫历史。

### 2. 审定句（草案 · PO 改字只动 locale）

| locale | 键 `CONFIDE_OBSERVATION_HONESTY` | 草案 |
|---|---|---|
| **en** | 冻表 + overlay 槽 | `Yin doesn't keep a running picture of you. What you allowed to remember is in What Yin remembers — not a pattern summary.` |
| **zh** | 同上 | `寅不做「你是个怎样的人」的总结。你允许记住的，在「阿寅记得什么」里——不是模式报告。` |
| **ja** | 同上 | （开工时对齐 en 观察式；可 draft） |

**为什么不是 memory_list**：用户问的是**综合观察**，不是「列出条目」。诚实边界 = 承认**没有**模式引擎；若要看离散条目，用户应问 `Show me what you remember`（已有 CI-03）。

### 3. 单测 + tracker

- `confideObservationHonesty.test.js`：正例 / 负例 / 与 `practice_facts`·`presence_facts` 不撞车  
- `confideExecutableTools.test.js`：补 `noticed about me` → null（仍不进 CI）  
- `desktopCompanionL2Route.test.js`：generate 门闩仍 false  
- `TEST_TRACKER` C1 行：过关标准改为 `data-source=observation_honesty` + 禁止编造

---

## 不做

- 7-way / L0 / E′ prompt 进 send  
- 用 L3 生成「你最近傍晚常来」  
- 把元观察 synthesize 进 Personal Memory  
- 等 Phase 2B 探针结果才 ship A 轨  
- 与 NL Actions / Memory 多语言同 PR

---

## Phase 2B B9/B10 探针（B 轨 · 可选 · 不挡 A）

**现状**：2B 冻 v4 金标 **已排除** B9/B10；Metal A/C/D + E′ **已结案**（architecture_none_pass · #520）。  
**若要做**：实验室加 2 条 fixture + 一次 `FT_INTENT_PHASE=2b-residual` 跑分——只回答「未来换模型/分类器有没有净收益」，**不改变** A 轨 ship 决策。

| id | 句 | 期望 label（探针用） |
|---|---|---|
| B9 | `What have you noticed about me?` | `OBSERVATION_META`（新探针标签，**不进**生产） |
| B10 | `I wonder what patterns you've picked up on.` | 同上 |

**口令**：「跑 C1 Phase 2B 探针」——可与 A 轨并行，**不得**阻塞 MVP。

---

## 冲突扫描

| 轴 | 判断 |
|---|---|
| **强度** | 0–1s 模板；不待网 |
| **人设** | 观察式诚实；不诊断、不教练、不好奇 |
| **职责** | ≠ `memory_list` / `presence_facts` / `preference_honesty` |

**无冲突。**

---

## 验收

- Electron 宽屏：Kelly 两句 → `observation_honesty` · 0–1s · 无 generate  
- 负例三句仍走 CI 原 `data-source`  
- `npm run test:smoke` 绿  
- 人工读 en 审定句语感

**口令**：「开工 Confide 元观察诚实空态」
