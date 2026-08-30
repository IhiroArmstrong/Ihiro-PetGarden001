# Task Brief · Yin Personal Memory · Slice 1f（Don't save this · memory suppress）

> **状态（2026-08-30）**：**PO 定稿 · 本旁支 runtime** · 政策 SSOT `YIN_PERSONAL_MEMORY_PERSISTENCE_POLICY.md`  
> **前置**：Slice 1b Remember · 1e 口头 Forget（CI-01）已合 develop

---

## 做什么

1. **Remember 门闩**：`rememberOptOuts[]` · inline 同句 opt-out · 发后撤回（上一 turn `confide:turn:N`）  
2. **路由**：`forget this` / 忘掉刚才那句 → **`memory_suppress`** · **不**走 CI-01  
3. **IPC**：`desktop:yin-personal-memory-record-opt-out` · `desktop:yin-personal-memory-suppress-post-recall`  
4. **Confide UI**：pre-tool 路由 · `data-source=memory_suppress`

## 不做

- 新 CI id · registry 膨胀  
- V1 发前 opt-out（Phase 2）  
- JA 触发句（locale 审前）  
- Web bridge

## 验收

- 单测：`yinPersonalMemorySuppress.test.js`  
- Electron 宽屏人工：政策 §5 / `SCENARIO_TESTS` AG · 1f  
- CI-01 回归不退化
