# Local AI Scenario Expansion · Product Owner Formal Decision

**状态（2026-08-28）**：**产品负责人正式拍板** · 会审结案 · **不是**逐项 runtime 开工令。  
**输入**：`LOCAL_AI_SCENARIO_EXPANSION_REVIEW.md`（#462）· `LOCAL_AI_SCENARIO_EXPANSION_DESIGNER_PRE_REVIEW.md`（#475）  
**规划 SSOT**：`LOCAL_AI_SCENARIOS_V1.md` · `CONFIDE_EXECUTABLE_INTENTS.md`  
**Phase 1 Briefs**：见 §执行清单

**签字**：Product Owner · 2026-08-28

**修订（2026-08-28 晚 · PO 书面同意）**：§V5 收窄释义 + §Bounded Temporal Compare + Phase 1B 问句扩列。见文末 **PO Amendment · Bounded Temporal Compare**。

---

## 决策总表

| 决策 | PO 结论 | 状态 |
|---|---|---|
| **V1 Understanding Layer** | 批准 **A** + **Understanding capability does not imply broader product authority** | ✅ |
| **V2 Journey Delete** | 批准 **Future Candidate**；**NOT MVP**；排在 read-only 之后 | 🟡 |
| **V3 Reflection** | 批准 **validation only**（用户主动点击 → one observation）；**NOT shipping** | 🟡 |
| **V4 MUST NOT ENTER** | 全部批准（产品原则，非 Not yet） | 🔒 |
| **V5 禁止项** | 全部批准 | 🔒 |
| **Capability Ceiling** | C0–C2 CORE（C2 = Retrieve + bounded Describe）；C3 Limited/Whitelisted；**C4 = not part of current product model** | 🔒 |
| **Top 1 NL Actions** | **CORE** · MVP 仅 Forget + Show Memory | ✅ |
| **Top 2 Ask Journey / Presence** | **CORE** · Retrieve + bounded Describe | ✅ |
| **Top 3 Reflection Companion** | **Candidate** · V3 validation path | 🟡 |

---

## V1 — APPROVED

采纳 Strategic Hypothesis：

> **Local AI may become Yin's understanding layer.**

**不**升级为正式对外产品定位；**不**改变现网窄例外政策句。

永久分离：

> **Understanding capability does not imply broader product authority.**

理解范围可渐扩；**产品权限不自动扩大**（主动发言 · 改数据 · 删数据 · 跨 App 执行 · Autonomous 均须单独产品决定）。

---

## V2 — APPROVED AS FUTURE CANDIDATE, NOT MVP

`DELETE_TODAY_JOURNEY_ENTRY` 可为未来严格白名单 **C3**：

- 仅删除**今天**、**明确一条** Journey 留痕  
- 禁止 bulk / historical wipe / ambiguous target  
- 须 Intent Contract 全链；模型不决定删哪条  

**排在 read-only Retrieve 能力之后**；Phase 1 **不开工**；**不**建 implementation task。

---

## V3 — APPROVED FOR VALIDATION, NOT SHIPPING

Reflection Companion 可进入 **validation / prototype**：

- **仅**用户主动触发（例：*Show me what you noticed.*）  
- **禁止** Reflection 提交后自动 generate  
- 输出 = **one short observation**，不是 response  
- 禁止 coach / diagnose / action list / assess progress / 抢 Reflection 结束感  
- generate 失败 → 回落安全行为 / 不显示  
- 定位：**Reflection Companion = a second mirror**（≠ AI coach）  
- 独立 Brief；**不与 CI-02 混 PR**  

**Validation approval ≠ shipping approval。**

---

## V4 — MUST NOT ENTER（产品原则）

Arrival · Breath · Moment Whisper · Basic Focusing · Celebrating · X2 touch  

> **AI does not improve the product value of these moments.**

不是技术限制 · 不是 MVP 暂缓。

---

## V5 — FULL BAN（2026-08-28 晚收窄释义）

**仍禁止（全球）**

- clinical **diagnosis**（临床诊断）
- **mental-health assessment**（心理健康评估 / 量表式结论）
- **crisis / emotion bucket generate**
- **person-level progress judgment**（对用户本人的进步/退步/品格评判句）
- **quantified scores / grades / rankings**（分数、等级、排名、百分比进步）

**不再一律禁止**

- 用户问「是不是比以前久 / 更稳定 / 更容易进入状态」等**对照型**口语 —— 归入 C2 **Bounded Temporal Compare**（见文末 Amendment），用本机记录做**两段时期并列事实**，**不是** Operating Tools，**不是** Interpret。

> **区分**：问「有没有变化」✅ 可答时期对照 · 答「你进步了/更稳定了」❌ 仍属 V5 人格评判。

---

## Capability Ceiling

| 级 | PO |
|---|---|
| C0–C2 | CORE |
| C2 内 | **Retrieve + bounded Describe**（见下） |
| C3 | Limited / Whitelisted |
| C4 | **NO** · not part of current product model |

### Retrieve 阶梯（SSOT）

| 层 | MVP |
|---|---|
| Retrieve | ✅ |
| bounded Describe | ✅ |
| **bounded Temporal Compare** | ✅（2026-08-28 晚 PO 修订；见 Amendment） |
| Interpret | ❌ 默认不开放 |
| Diagnose / Assess | ❌ 禁止（V5） |

### 新增 Retrieval 原则（SSOT）

> **Yin may describe patterns in the user's records, but should not define what those patterns mean about the person.**

中文：Yin 可以描述记录中的模式，但不应替用户定义这些模式意味着什么。

---

## Interaction Principles（SSOT）

1. **Understand more ≠ speak more.**
2. **Retrieve more ≠ judge more.**
3. **Execute more ≠ become autonomous.**
4. **AI should make existing moments deeper, not turn every moment into an AI conversation.**

---

## Local AI Phase 1（PO 批准范围）

### A · Natural-language Actions — CORE · MVP

| Intent | Phase 1 |
|---|---|
| Forget this | ✅ 现网 CI-01 |
| Show me what you remember | ✅ **新 read tool · 须 Brief 开工** |
| Don't save this | ❌ **未批准**（persistence / memory policy · 另审） |
| Delete today's Journey entry | ❌ **V2 Future Candidate** |

### B · Ask Journey / Presence — CORE · MVP

| 问句 | Phase 1 |
|---|---|
| When do I usually practice? | ✅ CORE |
| How have I been showing up? | ✅ CORE |
| What has my mood looked like recently? | ✅ CORE（**替代** Has my mood improved? 为正式示例） |
| Am I practicing longer / more than before? / 我是不是坚持得比以前久？ | ✅ CORE · **Temporal Compare** |
| Have I been more steady lately? / 我是不是最近比较稳定？ | ✅ CORE · **Temporal Compare** |
| Have I been getting into practice more easily? / 有没有更容易进入状态？ | ✅ CORE · **Temporal Compare**（仅可审计字段；禁止推断心流） |
| What have you noticed lately? | 🟡 observation-boundary **candidate**（不作普通 Retrieve 示例） |

### C · Reflection Companion — Candidate · validation only

用户主动点 → one observation · **不 shipping**

---

## Mood 问法（PO 批准 · SSOT）

**从正式示例删除：**

- Has my mood improved? / 我情绪这两周改善了吗？

**正式示例改为：**

- What has my mood looked like over the last two weeks?  
- What has my mood looked like recently?  
- 最近两周我的情绪看起来怎样？

**禁止示例方向（答句）**：improved / getting better / less anxious / emotional health improved · **你更稳定了** · **你坚持得更好了** · **你进步了** · 任意百分比/分数

**对照型问句（路由）**：`Has my mood improved?` / **是不是比以前久** / **是不是更稳定** 等可命中 Companion read / Temporal Compare；**答句仍须时期事实并列**，不得用「是，改善了」收尾。

---

## PO Amendment · Bounded Temporal Compare（2026-08-28 晚 · 书面同意）

### 产品意图

用户常用口语常带**时期对照**（比以前久、稳不稳、进状态顺不顺）。这些属于 **懂我 / 读本机记录**，不是 Operating（备份/更新），也不是临床诊断。PO 同意在 C2 内开放 **Bounded Temporal Compare**。

### 定义

> **Yin may compare two time windows using deterministic local records, but must not conclude what that comparison means about the person's character, progress, or mental health.**

中文：阿寅可以用本机记录**并列两段时期的事实**（次数、时长、封闭标签分布、时段模式），**不得**据此下「你更好了/更稳了/进步了」等人格或健康结论。

### 答句契约（工程须遵守）

| 必须 | 禁止 |
|---|---|
| 两段窗口并列（例：近 14 日 vs 前 14 日） | 单句人格评判（「你更稳定了」） |
| 数字来自 `PracticeDaysStore` / `presence-signals.v1` / Journey 可审计字段 | Qwen 编造或四舍五入捏造 |
| 数据不足 → `insufficient` 诚实说明 | 用 L3 闲聊假装答过 |
| 模板 / 确定性拼接 | improved / getting better / 分数 / 排名 / 诊断名 |

**允许答句示例**

- EN: *In the last two weeks you completed 5 sessions; in the two weeks before that, 3.*
- ZH: *最近两周记录里 calm 出现 4 次，再往前两周是 2 次。*

**禁止答句示例**

- *Yes, you've been more consistent.* / *你最近更稳定了。* / *Your discipline is improving.*

### 与 Operating Layer

Temporal Compare 走 **Companion Tools**（`query_*` + 确定性 handler + Read Hybrid NLU）。**不**因对照型问句开放 Operating Tools，**不**改「Confide 不得执行 backup/update」硬闸。

### runtime

本修订 **只锁 PO 边界**；实现归 **Phase 1B** 口令开工（可扩 CI-00/02 handler 或新增 `query_*`；须单测 + 冲突扫描）。**不是**自动开工令。

---

## 执行清单（会后文档 · 非自动 runtime）

| # | 动作 | 状态 |
|---|---|---|
| 1 | 更新 `LOCAL_AI_SCENARIOS_V1.md` | 本 PR |
| 2 | 更新 `CONFIDE_EXECUTABLE_INTENTS.md`（CI-02 示例措辞） | 本 PR |
| 3 | Brief · NL Actions MVP | `task-local-ai-phase1-nl-actions-mvp.md` |
| 4 | Brief · Ask Journey / Presence MVP | `task-local-ai-phase1-ask-journey-presence-mvp.md` |
| 5 | Brief · Reflection Companion Validation | `task-local-ai-reflection-companion-validation.md` |
| 6 | V2 Journey Delete | **仅** Future Candidate 记录；**无** implementation task |
| 7 | runtime / generate IPC | **等待**逐项「开工」口令 |
