# Task Brief · Local AI Phase 1 · Natural-language Actions MVP

> **状态（2026-08-28）**：**Brief 已建 · 未开工** · 须口令「开工 Local AI Phase 1 NL Actions」。  
> **PO 决策**：`LOCAL_AI_SCENARIO_EXPANSION_PO_DECISION.md` · `LOCAL_AI_SCENARIOS_V1.md` §Phase 1A  
> **权威**：`CONFIDE_EXECUTABLE_INTENTS.md` · `confideExecutableTools.js`

---

## 做什么（Phase 1 MVP）

1. **Forget this** — 现网 **CI-01**；本 Brief **不重做**；回归锚保留。  
2. **Show me what you remember** — 新 **read** tool（建议 CI-03 · `query_memory_list` 或等价 id）：  
   - 读 `yin-personal-memory.json`（Consent granted）  
   - 确定性模板列出条目摘要；**禁止** L3 编造  
   - 正则 + Read Hybrid 补漏（与 #472 同策略）  
3. **Intent Contract 全链**（C3 与未来扩展共用）：

```text
Natural Language → Intent Classification → Whitelisted Intent
→ Deterministic Target Resolution → Deterministic Execution
```

## 不做

| 项 | 原因 |
|---|---|
| **Don't save this** | **Slice 1f** · 见 `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md` · 非 1A scope |
| **Delete today's Journey entry** | V2 **Future Candidate** · Phase 2 · 排在 read-only 之后 |
| bulk wipe / 备份 / 更新 | Operating Layer · 不进 Confide |
| 模型直接写 | 写工具仍 regex + Consent |

---

## 冲突扫描

| 轴 | 对照 | 判断 |
|---|---|---|
| **强度** | AE Confide | 仅 Confide 内一句模板；无新全屏 |
| **人设** | AG Memory | 列表为事实摘要；不 coach |
| **职责** | AG 面板 Forget | 口头 Show 与面板互补；不替代 What Yin remembers UI |

---

## 验收

- registry + 纯函数 + 单测  
- Read Hybrid：`readOnly + autoExecute` 闸门  
- **人工**：Electron 宽屏 Confide — Forget 不变；Show memory 有 `data-source` 诚实模板  
- 更新 `CONFIDE_EXECUTABLE_INTENTS.md` + tracker  

**禁止**与 Ask Journey / Reflection validation 同 PR。
