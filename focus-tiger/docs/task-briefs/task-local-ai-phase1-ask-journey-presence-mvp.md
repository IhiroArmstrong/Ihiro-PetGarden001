# Task Brief · Local AI Phase 1 · Ask Journey / Presence MVP

> **状态（2026-08-28）**：**Brief 已建 · 未开工** · 须口令「开工 Local AI Phase 1 Ask Journey Presence」。  
> **PO 决策**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md`（含 **2026-08-28 晚 · Bounded Temporal Compare**）· `LOCAL_AI_SCENARIOS_V1.md` §Phase 1B  
> **前置**：#472 Read Hybrid 人工测；Presence CI-02 链路人验收

---

## 做什么（Phase 1 · Retrieve + bounded Describe + Temporal Compare）

### CORE 问句（正式示例）

| 用户意图 | 数据源 | 说明 |
|---|---|---|
| When do I usually practice? | `PracticeDaysStore` / Journey | 事实 + bounded 时间模式 |
| How have I been showing up? | Journey + 练习账本 | 描述性；禁止人格进步评判 |
| What has my mood looked like recently? / over the last two weeks? | `presence-signals.v1` | **替代**「Has my mood improved?」为 SSOT 示例 |
| Am I practicing longer / more than before? / 我是不是坚持得比以前久？ | `PracticeDaysStore` / Journey | **Temporal Compare**：近窗 vs 前窗次数/时长 |
| Have I been more steady lately? / 我是不是最近比较稳定？ | `presence-signals.v1` + 练习节奏 | **Temporal Compare**：标签或打卡分布并列 |
| Have I been getting into practice more easily? / 有没有更容易进入状态？ | 可审计练习/时段字段 | **Temporal Compare**；禁止推断「心流」；无字段则 insufficient |

### Bounded Temporal Compare（PO · SSOT）

> **Yin may compare two time windows using deterministic local records, but must not conclude what that comparison means about the person's character, progress, or mental health.**

**允许答句**

- *In the last two weeks you completed 5 sessions; in the two weeks before that, 3.*
- *最近两周记录里 calm 出现 4 次，再往前两周是 2 次。*

**禁止答句**

- *Yes, you've been more consistent.* / *你最近更稳定了。* / *Your discipline is improving.*

### CI-02 措辞迁移

- SSOT / 文档 / SCENARIO_TESTS **正式示例**改用描述性问法  
- 实现时：**新增** regex / hybrid 对描述性问句 + **对照型**问句（比以前久 / 稳不稳）  
- 旧「improved」句可保留为**路由 alias**（不推广为 SSOT 示例）  
- 答句：**描述性 breakdown 或两段时期并列**；≥3 条门槛（presence）；**禁止**诊断与人格评判

### Retrieve 原则（SSOT）

> Yin may describe patterns in the user's records, but should not define what those patterns mean about the person.

**允许：** You practiced most often in the evening. / 最近两周 5 次，前两周 3 次。  
**禁止：** Your discipline is improving. / You are becoming more anxious. / 你更稳定了。

---

## 不做 / 非 MVP

| 项 | 状态 |
|---|---|
| **What have you noticed lately?** | 🟡 **observation-boundary candidate** · 不作 Phase 1 普通 Retrieve 示例 · 另审 |
| Journey Delete | V2 Future Candidate |
| Interpret / Diagnose / 分数排名 | V5 禁止 |
| Operating Tools（备份/更新） | 不进 Confide |

---

## 冲突扫描

| 轴 | 对照 |
|---|---|
| **强度** | AE · Z Journey |
| **人设** | AF Presence · V5（人格评判仍禁） |
| **职责** | Journey Log UI · CI-02 与面板趋势 |

---

## 验收

- 新 read tool(s) 或扩展现有 CI-00/02 · registry + 单测  
- Temporal Compare：两窗并列模板 + insufficient 路径  
- SCENARIO_TESTS AE 步骤更新为描述性 + 对照型问法  
- **人工**：描述性/对照型问句 → `presence_facts` / practice facts；危机句仍走情绪桶；**禁止**答句出现「你更好了/更稳了」  
- tracker  

**禁止**与 NL Actions MVP / Reflection validation 同 PR。
