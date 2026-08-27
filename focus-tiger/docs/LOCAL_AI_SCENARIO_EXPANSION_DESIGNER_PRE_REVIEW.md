# Local AI Scenario Expansion · Designer Pre-Review

**状态（2026-08-28）**：设计师预审结论 · **Expected Position** · **不是产品负责人最终批准** · **不是 SSOT 变更** · **不是开工令**。

**会审输入材料（已合 develop · #462）**：`LOCAL_AI_SCENARIO_EXPANSION_REVIEW.md`  
**现网政策（本会未改）**：`LOCAL_AI_SCENARIOS_V1.md` · `CONFIDE_EXECUTABLE_INTENTS.md`

**禁止依据本文**：改 `LOCAL_AI_SCENARIOS_V1.md` 政策句 · 开 runtime · 新 generate IPC · 扩 CI 白名单 · 把 Top 3 标成 Approved。

---

## 设计师一句话结论

> Local AI 不应成为「让 Yin 更健谈」的能力，而应成为让 Yin 更准确理解用户的能力。当前产品优先开放 Natural-language Actions 与 Ask Journey / Presence；Reflection Companion 作为候选，必须经过 V3 后决定。C2 为主要能力上限，允许少量严格白名单 C3；C4 Autonomous 保持关闭。Arrival、Breath、Moment Whisper、Basic Focusing、Celebrating、X2 touch 保持 deterministic，列入 MUST NOT ENTER。
>
> 战略上可以保留「Local AI may become Yin's understanding layer」这一 hypothesis，但本次不把它升级为正式产品定位，也不改变现网窄例外政策。

---

## Interaction Principles（设计师建议 · 会后可写入 SSOT）

1. **Understand more ≠ speak more.**
2. **Retrieve more ≠ judge more.**
3. **Execute more ≠ become autonomous.**
4. **AI should make existing moments deeper, not turn every moment into an AI conversation.**

**C2 内部边界（Retrieve 阶梯）**

| 层 | 例 | MVP |
|---|---|---|
| Retrieve | I practiced 4 times this week. | ✅ |
| Describe | You practiced most often in the evening. | ✅ bounded |
| Interpret | You tend to avoid practice when stressed. | ❌ 暂不 |
| Diagnose / Assess | You are becoming more anxious. | ❌ 禁止（V5） |

> **Describe the record ≠ interpret the person.**

---

## V1–V5 预审票

| ID | 设计师选择 | 要点 |
|---|---|---|
| **V1** | **☑ A** | 采纳 understanding layer 为 **Strategic Hypothesis**；**不**写进正式定位；**不**改现网窄例外。理解范围可渐扩；产品权限不自动扩大。 |
| **V2** | **☑ 是 · 仅今天一条** | **Candidate C3**，非立即 CORE。须 Intent Contract 全链；禁止 bulk / 历史 wipe。模型只识别 `DELETE_TODAY_JOURNEY_ENTRY`，不决定删哪条。 |
| **V3** | **☑ 是 · 用户点一下才出** | **反对**提交后自动 generate。批准：用户主动点「Show me what you noticed」→ 极短 observation。须：不 coach / 不 diagnose / 不行动清单 / 不评价成长 / 不抢 Reflection 结束感 / 失败回落或不显示。独立 Brief；不与 CI-02 混 PR。 |
| **V4** | **☑ 全确认 MUST NOT** | Arrival · Breath · Moment Whisper · Basic Focusing · Celebrating · X2 touch。**不是**「Not yet」——是产品原则下不需要 AI。 |
| **V5** | **☑ 确认全禁** | 诊断 · 量化进步 · 危机/情绪桶 generate。Yin = Observer / Companion，不是 Therapist / Coach / Analyst。 |

---

## Current Capability Ceiling

| 级 | 预审 |
|---|---|
| C0–C2 | CORE（C2 = Retrieve + **bounded Describe**） |
| C3 | Limited / Whitelisted |
| C4 | **NO** |

---

## Top 3 预审

### ① Natural-language Actions · **CORE 方向**

| Intent | 预审 |
|---|---|
| Forget this | **CORE**（现网 CI-01） |
| Show me what you remember | **CORE**（Memory 自然语言界面） |
| Don't save this | **待定** |
| Delete today's Journey entry | **Candidate · 等 V2** |

### ② Ask Journey / Presence · **CORE 方向**（Retrieve + Describe only）

| 问句 | 预审 |
|---|---|
| How have I been showing up? | **CORE** |
| When do I usually practice? | **CORE** |
| What have you noticed lately? | **CORE**（严格 observation 边界） |
| Has my mood improved? | **CANDIDATE / 需改措辞** → 建议改为描述性问法，如 *What has my mood looked like over the last two weeks?* |

### ③ Reflection Companion · **CANDIDATE · 等 V3**

- V3 通过 → 用户主动点 → 轨道 **C**
- V3 不通过 → 轨道 **B** 或不做
- 产品潜力最高 · 设计风险最高

---

## Scenario Map 预审

| Moment | 分类 |
|---|---|
| Confide | **CORE** |
| Memory | **CORE** |
| Presence | **CORE** |
| Journey | **CORE**（Retrieve）；C3 Delete **等 V2** |
| Reflection | **CANDIDATE**（等 V3） |
| Recover | deterministic-first / **暂不 AI 化** |
| Arrival · Breath · Moment Whisper · Celebrating · Basic Focusing · X2 touch | **MUST NOT ENTER** |

---

## 正式 Top 3（设计师版）

**CORE**

1. Natural-language Actions — Understand → Execute  
2. Ask Journey / Presence — Understand → Retrieve → Describe  

**CANDIDATE**

3. Reflection Companion — Understand → Reflect（**必须 V3**）

---

## C3 Intent Contract（设计师确认）

```text
Natural Language
→ Intent Classification
→ Whitelisted Intent
→ Deterministic Target Resolution
→ Deterministic Execution
```

C3 权限由 **产品 Intent Contract** 决定，不由模型决定。

---

## 待产品负责人正式会审

本文全部条目仍为 **Expected Position**。正式会后若拍板，才允许：

1. 更新 `LOCAL_AI_SCENARIOS_V1.md` / `CONFIDE_EXECUTABLE_INTENTS.md`  
2. 开 Task Brief + tracker  
3. 按票开工（V2 Journey delete · V3 Reflection · 新 read tools 等）

**产品负责人签字 / 日期：** ________________  
