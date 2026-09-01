# fix-confide-forget-boundary-dual-match

| Gate 0.D 切片 3 · FORGET vs BOUNDARY 双命中 | 纯后端/逻辑 | 仅单元测试覆盖 | **Electron Consent 已 Allow**：发 `Please forget what I said about Monday. I'd rather not get into that.` → `[data-testid=confide-to-yin-reply]` `data-source=memory_forget`（禁止 `boundary`）。**AE 步 7** 纯边界句仍 `boundary`。**1f** `Don't save this` 仍 `memory_suppress`。Web / 无 Consent 双命中仍可走 `boundary`（CI-01 不能删）。不换 GGUF、不挂 E′ prompt。 | — | — | — | `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1 · 场景 AG 1e / AE 步 7 | 2026-09-01 |
