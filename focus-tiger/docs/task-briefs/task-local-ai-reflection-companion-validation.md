# Task Brief · Reflection Companion · Validation（非 Shipping）

> **状态（2026-08-28）**：**Brief 已建 · 未开工** · 须口令「开工 Reflection Companion Validation」。  
> **PO 决策**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · **V3 = validation only, NOT shipping**  
> **轨道**：轨道 **C · 仪式 generate**（仅验证分支；通过 validation 后再议 shipping Brief）

---

## 产品定位

> **Reflection Companion = a second mirror**  
> **≠ AI coach · ≠ therapist · ≠ task list**

用户已完成 Reflection（用户自己看见）→ **可选**主动邀请 Yin 再照见一次。

---

## 做什么（Validation scope）

1. **用户主动触发** — 例：*Show me what you noticed.* / 等效 i18n 控件；**0–1s** 可见反馈。  
2. **输入**：当次 Reflection 文本（+ PO 另批的数据范围）；**禁止**自动读全库做评判。  
3. **输出**：**one short observation** — not a response  
   - 倾向 **Observation**，不是 Interpretation，更不是 Advice  
   - 禁止 coach / diagnose / action list / assess progress  
4. **失败**：回落不显示或安全已审语料；**禁止**空白挡 Celebrating  
5. **Electron 宽屏** 窄例外；Web/375 **仍检索不生成**（除非 PO 另批）

## 明确不做

| 项 | PO |
|---|---|
| Reflection **提交后自动** generate | **否决** |
| Shipping / 无 flag 进生产 | **未批准** |
| 与 CI-02 / Presence MVP 同 PR | **禁止** |
| V4 MUST NOT 时刻 | 禁止 |

---

## 冲突扫描

| 轴 | 对照 |
|---|---|
| **强度** | Reflection 日签 · Celebrating · busy |
| **人设** | EMOTION_BIBLE · V5 |
| **职责** | Reflection 固定 UI · Memory 注入 |

Validation 通过标准：用户反馈「照见」而非「被打断 / 被指导」。

---

## 验收（Validation · 非关单 shipping）

- 原型 / lab flag · **不**默认开生产  
- 设计师 + PO 书面 validation 结论  
- 若 validation 通过 → **另开** shipping Brief + 冲突扫描；**本 Brief 不自动升级**

**Validation approval ≠ shipping approval.**
