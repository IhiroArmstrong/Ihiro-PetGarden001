# Task Brief · Local AI Phase 1 · Ask Journey / Presence MVP

> **状态（2026-08-28）**：**Brief 已建 · 未开工** · 须口令「开工 Local AI Phase 1 Ask Journey Presence」。  
> **PO 决策**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · `LOCAL_AI_SCENARIOS_V1.md` §Phase 1B  
> **前置**：#472 Read Hybrid 人工测；Presence CI-02 链路人验收

---

## 做什么（Phase 1 · Retrieve + bounded Describe）

### CORE 问句（正式示例）

| 用户意图 | 数据源 | 说明 |
|---|---|---|
| When do I usually practice? | `PracticeDaysStore` / Journey | 事实 + bounded 时间模式 |
| How have I been showing up? | Journey + 练习账本 | 描述性；禁止进步评判 |
| What has my mood looked like recently? / over the last two weeks? | `presence-signals.v1` | **替代**「Has my mood improved?」为 SSOT 示例 |

### CI-02 措辞迁移

- SSOT / 文档 / SCENARIO_TESTS **正式示例**改用描述性问法  
- 实现时：**新增** regex / hybrid 对描述性问句；旧「improved」句可保留为兼容 alias（不推广）  
- 答句仍：**描述性 breakdown**；≥3 条门槛；**禁止**诊断

### Retrieve 原则（SSOT）

> Yin may describe patterns in the user's records, but should not define what those patterns mean about the person.

**允许：** You practiced most often in the evening.  
**禁止：** Your discipline is improving. / You are becoming more anxious.

---

## 不做 / 非 MVP

| 项 | 状态 |
|---|---|
| **What have you noticed lately?** | 🟡 **observation-boundary candidate** · 不作 Phase 1 普通 Retrieve 示例 · 另审 |
| Journey Delete | V2 Future Candidate |
| Interpret / Diagnose | V5 禁止 |

---

## 冲突扫描

| 轴 | 对照 |
|---|---|
| **强度** | AE · Z Journey |
| **人设** | AF Presence · V5 |
| **职责** | Journey Log UI · CI-02 与面板趋势 |

---

## 验收

- 新 read tool(s) 或扩展现有 CI-00/02 · registry + 单测  
- SCENARIO_TESTS AE 步骤更新为描述性问法  
- **人工**：描述性问句 → `presence_facts` / practice facts；危机句仍走情绪桶  
- tracker  

**禁止**与 NL Actions MVP / Reflection validation 同 PR。
