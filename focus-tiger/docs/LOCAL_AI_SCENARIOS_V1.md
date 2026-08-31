# 本地 AI 场景规划 · V1

**状态（2026-08-28）**：**产品会审已拍板**（PO · `LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md`）· **2026-08-28 晚 PO 修订：Bounded Temporal Compare** · Phase 1 Brief 已建 · **runtime 须逐项开工口令**。  
**SSOT 交叉引用**：`LOCAL_AI_PHASE1_TASK_PLAN.md`（执行计划 · Gate 0.2 A/B/C）· `CONFIDE_EXECUTABLE_INTENTS.md` · `LOCAL_AI_OPERATING_LAYER.md` · `LOCAL_AI_SCENARIO_EXPANSION_REVIEW.md` · `task-local-ai-phase1-nl-actions-mvp.md` · `task-local-ai-phase1-ask-journey-presence-mvp.md` · `task-local-ai-reflection-companion-validation.md` · `task-confide-read-hybrid-v1.md` · `YIN_PERSONAL_MEMORY.md` · `YIN_PERSONALIZATION_ENGINE.md`

---

## 0. 战略假设 vs 现网政策（V1 · 已批准）

**Strategic Hypothesis（不升级为对外定位）**

> Local AI may become Yin's understanding layer.

**Current product policy（不变）**

> Local AI is only available at explicitly defined interaction boundaries.

**永久分离（PO · 2026-08-28）**

> **Understanding capability does not imply broader product authority.**

本地 AI = **桌面端窄例外**：Electron 宽屏 Confide **fallback** 短生成 + **层 3 之前**的确定性事实/动作路由。

```text
0 Safety → 1 仪式语料（无 generate IPC）→ 2 情绪桶语料 → CI 白名单 → 3 L3 短生成
```

**不是**：开放域 Agent · Web/PWA 生成 · 诊断/教练清单 · **C4 Autonomous**（not part of current product model）。  
**不是** Auto-Operating：见 `LOCAL_AI_OPERATING_LAYER.md`；现网仍走专门 UI。

---

## 0.1 Interaction Principles（PO · SSOT）

1. **Understand more ≠ speak more.**
2. **Retrieve more ≠ judge more.**
3. **Execute more ≠ become autonomous.**
4. **AI should make existing moments deeper, not turn every moment into an AI conversation.**
5. **Boundary Respect（2026-08-31）**：用户未要求解释、分析或建议时，Yin 必须克制。表达「不确定要不要谈」时，禁止贴心理状态标签。评测权重大于 MMLU / 换模型分数。
6. **Primary intent + context**：一句里同时有情绪与动作时，先承接动作（陪伴坐下、开始、Forget）；情绪只作 context。**不等于**把 Confide 生成开进 Arrival 仪式（V4 仍锁）。

权威：`PRINCIPLES.md`「用户体验优先」。禁止在未拆开「模型能否标 intent」与「pipeline 是否压扁」之前换默认模型。

**Retrieval 原则**

> **Yin may describe patterns in the user's records, but should not define what those patterns mean about the person.**

**C2 阶梯**：Retrieve → bounded **Describe** ✅ → bounded **Temporal Compare** ✅（PO 2026-08-28 晚）· Interpret ❌ · Diagnose/Assess ❌（V5）

**Temporal Compare 原则（PO · SSOT）**

> **Yin may compare two time windows using deterministic local records, but must not conclude what that comparison means about the person's character, progress, or mental health.**

并列两段时期事实 ✅ · 「你更稳了/进步了」等人格结论 ❌。

---

## 0.2 Capability Ceiling（PO · 已锁）

| 级 | 含义 | PO |
|---|---|---|
| **C0–C2** | Understand / Respond / Retrieve + bounded Describe | **CORE** |
| **C3** | Whitelisted Execute | **Limited** |
| **C4** | Autonomous | **NO** · not part of current product model |

**C0–C4** 是能力描述，不是 roadmap。技术上能到 C3 ≠ 产品应开放。

---

## 0.3 MUST NOT ENTER（V4 · 产品原则）

Arrival · Breath · Moment Whisper · Basic Focusing · Celebrating · X2 touch  

> **AI does not improve the product value of these moments.**

不是「Not yet」——模型更强**不是**重新打开的理由。

---

## 1. Local AI Phase 1（PO 批准 · 未自动开工）

### Phase 1A · Natural-language Actions — **CORE**

| Intent | Phase 1 | Brief |
|---|---|---|
| Forget this | ✅ 现网 CI-01 | — |
| Show me what you remember | ✅ 新 read tool | `task-local-ai-phase1-nl-actions-mvp.md` |
| Don't save this | ✅ **已批准** · Slice 1f | `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` |
| Delete today's Journey entry | ❌ V2 Future Candidate | 见 §1.1 |

### Phase 1B · Ask Journey / Presence — **CORE**

| 问句 | Phase 1 |
|---|---|
| When do I usually practice? | ✅ |
| How have I been showing up? | ✅ |
| What has my mood looked like recently? | ✅（**SSOT 正式示例**；替代 improved 问法） |
| Am I practicing longer / more than before? / 我是不是坚持得比以前久？ | ✅ · Temporal Compare |
| Have I been more steady lately? / 我是不是最近比较稳定？ | ✅ · Temporal Compare |
| Have I been getting into practice more easily? / 有没有更容易进入状态？ | ✅ · Temporal Compare（仅可审计字段） |
| What have you noticed lately? | 🟡 observation-boundary candidate · **非** Phase 1 普通 Retrieve |

Brief：`task-local-ai-phase1-ask-journey-presence-mvp.md`

### Phase 1C · Reflection Companion — **Candidate · validation only**

- 用户主动点 → **one short observation**（second mirror · 非 coach）  
- **禁止**提交后自动 generate  
- Brief：`task-local-ai-reflection-companion-validation.md`  
- **Validation approval ≠ shipping approval**

---

## 1.1 Future Candidates（已批准方向 · NOT MVP）

| 项 | PO | 工程 |
|---|---|---|
| **`DELETE_TODAY_JOURNEY_ENTRY`** | Future Candidate C3 · 仅今天一条 · 排在 read-only **之后** | **无** implementation task |
| **Reflection shipping** | 须 validation 通过后再议 | 独立 shipping Brief |
| **Don't save this** | ✅ Slice 1f · pipeline | `memory_suppress` |

Intent Contract（C3 与未来 Execute 共用）：

```text
Natural Language → Intent Classification → Whitelisted Intent
→ Deterministic Target Resolution → Deterministic Execution
```

---

## 1.2 Tool Registry（现网 + Phase 1）

```text
Safety / 情绪桶 → Tool Registry (CI-xx) → 确定性 handler → L3 短生成
```

**Read Hybrid V1（#472 已合）**：regex miss → 仅 read + autoExecute；写仍 regex + Consent。

---

## 2. 三条轨道（实现分类 · Phase 5）

| 轨道 | Phase 1 |
|---|---|
| **A · CI-xx** | Phase 1A + 1B read tools |
| **B · L3 被动注入** | Memory 1d 等；Reflection 仅 validation 失败退路 |
| **C · 仪式 generate** | **仅** Reflection Companion **validation**；**非** shipping |

**混 PR 禁止**：1A / 1B / 1C validation 须分 PR。

---

## 3. 已落地 / 在途

### 3.1 Confide 口头白名单（轨道 A）

| ID | 用户意图（SSOT 示例） | 数据源 | 状态 |
|---|---|---|---|
| **CI-00** | 练了多久 / How long have I practiced? | `PracticeDaysStore` | **#424 已合** |
| **CI-01** | 口头 Forget 单条 | `yin-personal-memory.json` | **#434 已合** |
| **CI-02** | 最近两周情绪看起来怎样 / What has my mood looked like over the last two weeks? | `presence-signals.v1` | 在途 · `presence_facts` |
| **（Phase 1）** | Show me what you remember | Memory store | Brief 已建 · **未开工** |

> CI-02 答句：封闭标签 · 14 日 · ≥3 条 · **描述性 breakdown**；**禁止**诊断与人格进步评判。  
> **Temporal Compare（PO 2026-08-28 晚）**：对照型问句（比以前久 / 稳不稳 / 进状态）可路由；答句须**两段时期并列事实**，禁止「你更好了/更稳了」。  
> **正式示例不再推广**「Has my mood improved? / 改善了吗」——可作路由 alias；答句仍不得用 improved 收尾。

### 3.2 Yin Personal Memory

Slice 0 → 1e **已合**。Reflection **validation** 见 Phase 1C；**非**全局仪式 generate 批准。

### 3.3 V5 禁止（全球）

临床诊断 · 心理健康评估 · 人格进步/退步评判句 · 分数/排名/百分比量化 · 危机/情绪桶 generate · coach 清单。

**≠** 禁止时期对照：见 §0.1 Temporal Compare。

---

## 4. Presence Signals 路线图

不变；CI-02 与 Phase 1B 对齐。见 `task-presence-signals-slice-0-1.md`。

---

## 5. 明确不做（Phase 1）

| 用户可能说 | 为何 |
|---|---|
| 帮我备份 | Operating Layer |
| 忘掉一切 | bulk wipe |
| Don't save this | ✅ PO 定稿 2026-08-30 · Slice 1f |
| Delete Journey（Phase 1） | V2 Future Candidate |
| Journey / Reflection 润色（非 validation） | 未批准 |
| V4 各仪式时刻 generate | MUST NOT ENTER |

---

## 5.1 YPE

编排层；**不是** Phase 1 扩 CI 清单。见 `YIN_PERSONALIZATION_ENGINE.md`。

---

## 6. 我认为最合理的下一刀

**执行步骤 SSOT**：`LOCAL_AI_PHASE1_TASK_PLAN.md`（含 Gate 0.2 · #472 Read Hybrid 验收 A/B/C · **Gate 0.D Yin Intent Diagnostic**）。

1. **Gate 0.D**：已合 #495；换模型前仍以 intent JSON 为准。  
2. **#472 Read Hybrid**： **2026-09-01 关单**（C-3 suspend · C-5 follow-up 另轨）。  
3. **口令开工 Phase 1B**（Ask Journey / Presence · 含 CI-02 描述性问法迁移）— 与 Presence 旁支可协调，**仍分 PR 职责**。  
4. **口令开工 Phase 1A**（Show memory read tool）。  
5. **口令开工 Reflection validation**（**非** shipping）。  
6. V2 Journey Delete · **不开工**。（Don't save → Slice 1f 已批准）  
7. **禁止**：0.D 未出结论就开多模型 Benchmark / 换默认 GGUF。

**较弱**：未发「口令 1B」就写 1B shipping；把 validation 当 shipping；仪式侧 MUST NOT 破例；用「短句很 Yin」当理解过关。

---

## 7. 新增场景准入 checklist

1. 可审计数据源或 Intent Contract 清晰的 C3  
2. Confide 内轻于专门 UI  
3. `SCENARIO_TESTS.md` 冲突扫描  
4. 更新 **本文件** + `CONFIDE_EXECUTABLE_INTENTS.md` + Brief + tracker  
5. 系统操作 → `LOCAL_AI_OPERATING_LAYER.md`，不进 Confide 表
