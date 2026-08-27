# Local AI Layer — Scenario Expansion Design Review

**状态（2026-08-28）**：会审材料 · **产品会审已结案** · 正式决策见 [`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md`](./LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md) · **不是开工令**。

**会议名**：Local AI Scenario Expansion Design Review  
**不是**：Local AI implementation planning。

| 文档 | 关系 |
|---|---|
| 本文 | 产品/设计会审（第一层） |
| `LOCAL_AI_SCENARIOS_V1.md` | Confide 现锁 + 轨道 A/B/C（第三层；本会**不改政策句**） |
| `LOCAL_AI_OPERATING_LAYER.md` | Auto-Operating ≠ Confide（已方向锁；Backup/Update 不进倾诉） |
| `CONFIDE_EXECUTABLE_INTENTS.md` | 现网 CI 白名单 |

**会前产品/设计立场（2026-08-28）**：下文「立场」可作会前对齐；标 **Open product decision** 的项必须现场唱名，不得会前当已锁。

---

## 0. 两句不能混

**Strategic hypothesis（可讨论，本会不锁成定位）**

> Local AI may become Yin's understanding layer.

**Current product policy（现网仍有效）**

> Local AI is only available at explicitly defined interaction boundaries.

心智上可以是理解层；现网入口仍以用户主动打开的 **Confide / Memory /（仅当批准后的）Reflection** 为主。  
**C4 Autonomous 本会立场：关闭。** 理解更多 ≠ 获得寻找用户说话的权力。

**C0–C4 是能力描述，不是 roadmap。** 某场景技术上能到 C3，不表示产品应该开放 C3。

---

## 1. 正式会程（固定顺序）

### Phase 1 — Product Boundary

Local AI 为什么存在？它现在**不是**什么？

会前立场（须口头确认，可改）：

- Companion intelligence（在划定入口内）
- **Not** autonomous agent
- **Not** therapist
- **Not** coach
- **Not** whole-App operating layer（系统备份/更新见 `LOCAL_AI_OPERATING_LAYER.md`，不进 Confide）

### Phase 2 — Scenario Review

逐格问：这个用户时刻有没有一个**只有「理解用户」才能创造的增量价值**？  
普通 UI 已经够 → 填 **No AI**，**不要**再找 A/B/C。

产出：**CORE / CANDIDATE / MUST NOT ENTER**

### Phase 3 — Current Capability Ceiling

现在最高允许到哪里？（不是无限 Agent 阶梯）

会前建议：**C2 Retrieve + 少量白名单 C3 Execute** · **C4 = NO**

### Phase 4 — Top 3（候选，非预批准）

### Phase 5 — Engineering Mapping（最后）

A · CI / B · Passive injection / C · Ritual generate  

若产品层 **MUST NOT ENTER**，工程层**不存在**「寻找接入方式」的任务。  
**产品决定能力；工程决定实现轨道。**

---

## 2. Open product decisions（V1–V5 · 现场唱名）

会前**不得**假设已解决。对照：Y Whisper · X Recover · X2 · S Breath · Z Journey · AE Confide · AF Presence · AG Memory。

| ID | 轴 | 问题 | 会前立场（非锁） |
|---|---|---|---|
| **V1** | 职责 | 战略「理解层」vs 现网窄例外 / 明示入口 | 两句分开写；本会不把 hypothesis 锁成定位 |
| **V2** | 职责 | 「删今天这条 Journey」是否进自然语言 **Execute** | **必须单独投票**。Retrieve ≠ Execute。批准则仍是：用户明示命令 → 白名单意图 → 确定性执行；**禁止**模型自己决定删什么。≠ Auto-Operating 的 backup/update |
| **V3** | 人设 | Reflection 是否 **generate 新句**（突破 deterministic ritual） | **必须单独投票**。通过前 Reflection Companion = **Candidate**，不是 Approved |
| **V4** | 强度 | Arrival / Breath / Whisper / 基础 Focusing / Celebrating / X2 | 会前立场：**MUST NOT ENTER**（产品原则，不是工程没做） |
| **V5** | 人设 | 诊断、量化进步、危机桶 generate | 会前立场：**全球禁止**；观照者，不是教练 |

---

## 3. C0–C4（能力描述 · 勿与 YPE / Electron / 路由 L 层混称）

| 级 | 含义 |
|---|---|
| **C0 Understand** | 只理解，不说话、不改数据 |
| **C1 Respond** | 理解后给一句回应 |
| **C2 Retrieve** | 读用户自己的本地账本 |
| **C3 Execute** | 改本地数据（白名单） |
| **C4 Autonomous** | 系统自己判断现在该说/该做 |

### Current Capability Ceiling（会前建议 · Phase 3 表决）

| 级 | 本会建议 |
|---|---|
| C0–C2 | 可在 CORE 入口内讨论 |
| C3 | **少量**、白名单、用户明示命令 |
| C4 | **NO** |

---

## 4. 谁可以开口

与现有 `busy / suppress / cooldown` **完全一致**。

**Allowed**

- 用户打开 Confide → Yin 回应
- 用户主动 Recover → Yin 回应（现网：已审语料 + 动效；**不是**本会批准 generate）
- 用户填写 Reflection → 仅当 **V3 通过** 才「根据内容回应」
- 用户主动问 Journey / Presence → 检索回答（C2）

**Not allowed**

- Yin 判断用户「可能需要帮助」而主动找人
- Yin 检测到某种状态而自行开始 Confide
- Yin 自己决定提醒、Recover、询问、干预

原则：AI 可以增强用户**主动打开**的时刻，暂时不要获得**寻找用户说话**的权力。

---

## 5. Scenario Map（Phase 2 主表）

保留 **Current UI Enough?**。够 → **No AI**。

| Moment | User Need | Current UI Enough? | Unique AI Value | AI Role | Initiator | Data Scope | Can Execute? | MVP |
|---|---|---|---|---|---|---|---|---|
| Confide | | | | | | | | |
| Memory | | | | | | | | |
| Presence | | | | | | | | |
| Journey | | | | | | | | |
| Reflection | | | | | | | | |
| Recover | | | | | | | | |
| Arrival | | | | | | | | |
| Breath | | | | | | | | |
| Moment Whisper | | | | | | | | |
| Celebrating | | | | | | | | |
| Basic Focusing | | | | | | | | |
| X2 touch | | | | | | | | |

会后填：

- **CORE**：
- **CANDIDATE**：
- **MUST NOT ENTER**：（见 §6，可增删但须写产品理由）

---

## 6. MUST NOT ENTER（正式交付物）

**不是**「工程现在没做」，而是 **产品价值不需要 AI**。  
以后模型更强，也**不**因此自动获得接入权。

会前名单（Phase 2 可确认或改）：

| Moment | 产品理由 |
|---|---|
| Arrival | 固定仪式已够 |
| Breath | 体验是仪式本身 |
| Moment Whisper | 一生一次淡出句，不是教导 Banner |
| Basic Focusing | 同坐，不需要模型插话 |
| Celebrating | 完成确认已有动效与已审语料 |
| X2 touch | 确定性摸头，不需要理解层 |

---

## 7. Interaction Principles（会前草案 · Phase 1/3 定稿）

1. **AI should help Yin understand the user, not make Yin more talkative.**
2. **AI should make existing moments deeper, not turn every moment into an AI conversation.**
3. 普通 UI 已经很好 → **No AI**。
4. 产品决定能力；工程决定轨道。MUST NOT ENTER 的时刻，工程不得「找接入方式」。

---

## 8. Top 3（候选 · Phase 4）

三项都是 **候选**。**不是**全部预批准。

| # | 方向 | 用户故事例 | 状态 |
|---|---|---|---|
| ① | **Natural-language Actions** | 「Forget this.」「Show me what you remember.」「Delete today's Journey entry.」 | Forget / 展示记忆可谈 CORE；**Journey Delete = V2**，不得从只读查询推导 |
| ② | **Ask Journey / Presence** | 「How have I been showing up?」「What have you noticed lately?」 | **C2 Retrieve**。描述性观察；禁止诊断与百分比。≠ Journey Delete |
| ③ | **Reflection Companion** | 用户表达后，极短 observation | **Candidate**。若 generate 新句 = 仪式 generate，**必须过 V3**。V3 否决则退回 **passive observation / injection（轨道 B）**，禁止把 generate 当作「Reflection 功能」继续推进 |

「What happened in my Journey?」= Retrieve。  
「Delete today's Journey entry.」= Execute。两件事分开投。

不要会前写死：「轨道 C 全不做 ⇒ 扩展只剩 Presence + 少量 CI」。C 不批准 generate 时，Reflection 仍可能以 **B** 存在——那是产品能力，不是轨道倒推 roadmap。

---

## 9. Engineering mapping（Phase 5 附件）

会末才填。混 PR 禁止。YPE（何时沉默）不是本会扩权。

| 产品决定 | A · CI | B · 只读注入 | C · 仪式 generate |
|---|---|---|---|
| NL Actions（Forget 等） | | — | — |
| Journey / Presence 询问 | | 若仅 Confide 闲聊注入 | — |
| Journey Delete | 仅当 **V2 是** | — | — |
| Reflection Companion | — | V3 **否** 时的退路 | 仅当 **V3 是** |
| MUST NOT ENTER 各时刻 | — | — | **不寻找接入** |

本文件**不**批准任何新 generate IPC。

---

## 10. 给主持的一句话

> 这场会画 CORE / CANDIDATE / MUST NOT ENTER 和 Current Capability Ceiling；V2、V3 必须唱名。理解层只是战略假设。C4 关闭。A/B/C 是会末工程附件。
