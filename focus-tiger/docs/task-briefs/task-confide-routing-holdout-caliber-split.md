# Task Brief · Confide 路由盲测考核口径拆分

> **状态（2026-10-17）**：设计说明，**待 PO 点头**。点头前 **不得** 真跑 `confide-routing-blind-en/b-v6`，**不得** 改发送链，**不得** 开 CR-11 / CR-45。  
> **任务类**：**A 类**（只改关单怎么量；不改变用户听到的路由 / 回复 / 等待）。切 live 仍是既有 Brief 的 **B 类**，本文件不授权。  
> **交叉**：[`task-confide-routing-arbitration-v1.md`](./task-confide-routing-arbitration-v1.md) · [`task-confide-class-blind-acceptance.md`](./task-confide-class-blind-acceptance.md) · [`CONFIDE_STATUS.md`](../CONFIDE_STATUS.md) G2 · [`PRINCIPLES.md`](../PRINCIPLES.md) R-0 · [`SCENARIO_TESTS.md`](../SCENARIO_TESTS.md) 场景 AE  
> **跟进**：CR-10 关单尺子（本文件）；CR-11 / CR-45 **不在本刀**。

---

## 0. 大白话（给拍板用）

现在路由关单把八类绑在同一把尺子上：都要 **函数 A @ 0.01** 过 85%，八类同时过才算过。这把尺子只能回答「产品分是否明显高于情绪分」，**分不出**「该念短答」还是「该诚实空态」，也测不出徽章是不是被念成寅币。

后三次（及中文 b-v6）盲测里，诚实空态、产品压情绪、情绪占上风反复过不了 85%。继续用同一把尺子去打英文未见卷，多半再验证一遍旧结论，并占掉 `en/b-v6` 的第一次读数。

要改成：**按尺子能量的东西分带关单**。85% 线不降。函数 A 只关它该关的带。短答 vs 空态 vs 徽章走全影子 / 现网 `data-source`。场景 AE 两锚仍 100% 短答。英文未见卷继续封存，点头后再另会话打分。

---

## 一、为何必须拆（不是降线）

| 混在一起的东西 | 现 holdout 实际在量 | 问题 |
|---|---|---|
| `mixed` / `product-over-emotion` / `mixed-emotion-dominant` | 函数 A：分句 `product − mood` 最大差 vs 0.01 | 这是函数 A 的本职；三类是已知结构短板 |
| `life-emotion` / `chitchat` | 同上，期望不走产品 | 粗闸够用；与「短答 vs 空态」无关 |
| `product-short-answer` / `product-honest-empty` | 只判 `productPath` 真假 | **短答与空态在脚本里是同一个桶**；过了不等于念对 |
| `badge-yin-coin` | 同上，期望走产品 | **测不出**「不得念寅币短答」 |
| 场景 AE 两锚 | 被折进短答类的 60 条 | 关单锁，**不算未见**；`locale` 字段脚本不读 |
| G2 事实到达 | 另一套 `audit:g2-fact-arrival` | 已与八类脱钩；不可再绑回「八类同时」 |

**禁止**：为让三类过线而调 0.01、改函数 A、或把 85% 改成更低的数。拆的是 **关谁的单**，不是放水。

---

## 二、建议的五带（点头后才替换旧「八类同时」）

点头前：[`task-confide-routing-arbitration-v1.md`](./task-confide-routing-arbitration-v1.md) 的「八类同时 ≥85%」**字面仍在**；因此 **禁止**用旧线去跑 `en/b-v6`。点头后：G2「够用」与仲裁 Brief 关单节改指向下表。

### 带 A · 函数 A 产品闸（CR-10 holdout 真跑）

| 类 | 期望 | 尺子 | 过关 |
|---|---|---|---|
| `mixed` | 走产品 | 函数 A @ 0.01 | ≥85% 且 n≥60 |
| `product-over-emotion` | 走产品 | 同上 | ≥85% 且 n≥60 |
| `mixed-emotion-dominant` | 不走产品（情绪 / 观察翼） | 同上 | ≥85% 且 n≥60 |

这三类仍可能是结构天花板。点头不等于它们已经能过；点头只表示 **过不了就停在 CR-10，不得假装八类里别的类能把它们抬过线**。若三类仍不过，下一步是产品规格（例如 CR-45 的合并回应），**不是**再刷未见卷。

### 带 B · 非产品粗闸（可与带 A 同一文件、同一脚本）

| 类 | 期望 | 尺子 | 过关 |
|---|---|---|---|
| `life-emotion` | 不走产品 | 函数 A `expectedPath=mood` | ≥85% 且 n≥60 |
| `chitchat` | 不走产品 | 同上 | ≥85% 且 n≥60 |

### 带 C · 产品闸细档（函数 A **不得**当关单）

| 类 | 期望 | 尺子 | 过关 |
|---|---|---|---|
| `product-short-answer` | `data-source=product_knowledge` | 全影子或现网源，**不是** `productPath` | 另填；默认沿用 ≥85% + n≥60，待点头时锁定读口 |
| `product-honest-empty` | `data-source=product_knowledge_honesty`，禁止 generate | 同上 | 同上 |
| `badge-yin-coin` | 诚实空态口径；**不得**寅币短答 | 同上 | 同上 |

未点头带 C 读口之前，这三类在函数 A 汇总里 **只报诊断、不写入 `pass_criteria_met` 关单与**。

### 带 D · 场景 AE 锚（关单锁）

两锚必须 **catalog 短答 100%**（各 n=1）。原文来自场景表，不算未见。可放在英文信封里且 `locale: zh`；脚本按 **中文原文** 向量打分。不得因语言混放而从短答类剔除。

### 带 E · G2 事实到达（已有，不并入八类）

`audit:g2-fact-arrival`。关单仍看「问到的事实到没到」。禁止用带 A 通过率代替。

---

## 三、CR-11 切 live 前置（建议 · 待点头）

同时满足才允许另口令切 live（本文件仍不授权切）：

1. 带 A + 带 B 在**一份未见**路由封存上过关（函数 A @ 0.01；每文件一次）。  
2. 带 D 两锚 100%。  
3. 冻表不退步；热态 TTFT ≤100 ms（既有）。  
4. 带 C / 带 E **不**作为函数 A 的八类同时门；分别走全影子 / 事实到达。  
5. **不调 0.01。不改发送链直到切 live 口令。**

CR-45 仍排在 CR-11 之后；通过率关单仍「再填」，本拆分 **不**替 CR-45 填线。

---

## 四、额度与未见卷（记账）

**技术额度**（`authorizeHoldoutRun`）：按 `holdout_set_version` **整串**。同一串最多 2 个文件，每文件 1 次。`confide-routing-blind-en/b-v6` 与 `confide-routing-blind-zh/b-v6` **不共用**。

**日志（2026-10-17 查）**：`zh/b-v2`、`zh/b-v5`、`zh/b-v6` 各已 voided 1 文件。`en/b-v6` **尚未入日志**。

**政策额度**（2026-10-15 拍板）：b-v2 + b-v5 视为路由过关额度已满，**不接受「每版本号各剩一次」**。因此：即使 `en/b-v6` 技术上是新格，**真跑仍须 PO 书面**（本口径点头，或另行接受「大概率不过、仍占额」）。zh/b-v6 是状态板漏记的又一次占用，本刀只把叙事补齐，**不**把那一次改成未占用。

**en/b-v6**：继续封存、不打分。价值在未见。出题会话 / 本设计会话 **不贴原句**；评分方另开会话、另 `author_prompt_id`，且不得读出题 Chat。

信封对账：八类各 60、合计 **480**。AE 两锚折进 `product-short-answer` 的 60 条，没有在 480 外另加 2 条。

---

## 五、非目标

- 不改 `resolveProductKnowledgeGateAction` / 发送链 / 0.01。  
- 不开 CR-11、CR-45、CR-47 实现。  
- 不读作废封存原句、不读路由开发集、不把作废句写入生产示例。  
- 不把带 C 塞回函数 A 关单来「凑八类」。  
- 不把本设计当成已经过关。

---

## 六、实现（仅点头之后，另口令）

A 类文档 / 实验室，口令须含「按已点头的考核口径拆分 Brief」：

1. `routingClassMeetsPassCriteria` / 汇总 stdout：带 C 三类不进关单与；带 A/B 仍 ≥85%。  
2. 更新仲裁 Brief 关单节、STATUS G2「够用」定义，使之与五带一致。  
3. 带 C 读口另 Brief 或本 Brief 补节（全影子 `data-source`），**不得**在未定点头读口时真跑 en/b-v6。  
4. 单测只锁「关单与按带计算」，禁止 echo 原句。

---

## 七、共用机制核对

本次不触及 overlayBusy / HUD 呼吸驱动 / z≥17 遮罩 / 新建可点击叠层，核对跳过。

---

## 八、变体矩阵 / 点击 / 边缘

本次不新增练习种类、商品类型、宽窄视口分叉或多语言入口差异，变体矩阵跳过。

本次无可点击交互改动，点击反馈节跳过。

本次无付款/已购/练习结束/窄屏专属分支，边缘状态节跳过。

---

## 九、冲突扫描（对照场景 AE）

| 轴 | 相邻 | 判断 |
|---|---|---|
| 职责 | AE catalog 真命中（接地练习 / A Quiet Line） | **无冲突**。带 D 维持 100% 短答，禁止改成观察翼或空态。 |
| 职责 | AE 未命中诚实空态 | **无冲突**。带 C 把空态从函数 A 关单拆出，**不**放宽「未命中须空态、禁止 generate」。 |
| 职责 | CR-45 混合句先情绪再产品 | **无冲突疑点需拍板**：带 A 仍用函数 A 量「走产品 vs 走情绪」；CR-45 是切 live 之后的合并回应，本刀不实现。 |
| 强度 | 用户仍发一句等一句 | **无冲突**。本刀无运行时。 |
| 语气 | 不改倾诉文案 | **无冲突**。 |

---

## 十、验收（本设计 PR）

- Brief 落在 `docs/task-briefs/`，PO 能按五带拍板。  
- STATUS / DECISIONS 额度叙述与 `routing-class-holdout-runs.json` 对齐（zh/b-v6 已占一次；en/b-v6 未跑）。  
- **未**跑 `audit:routing-class-holdout`（无 `:validate`）。  
- **未**改 `focus-tiger/src`。

点头口令示例：「按考核口径拆分 Brief 点头」→ 此后才允许（另会话）改实验室关单与、打 en/b-v6。
