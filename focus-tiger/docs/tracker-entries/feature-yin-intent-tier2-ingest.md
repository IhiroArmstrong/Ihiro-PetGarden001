# feature/yin-intent-tier2-ingest

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin Intent Diagnostic Tier 2（v3.1 盲测 12 条） | 纯后端/桌面 | 仅单元测试覆盖 | **无产品 UI。** 不改 Confide send / L3 / 默认 GGUF。自动化：`confideIntentDiagnostic.test.js`（12 条 + 2b/Phase1-2 三词查重）。实验室（须本机 1.7B · 系统终端 Metal）：`cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=E FT_INTENT_TIER2=1 npm run companion:intent-diagnostic`。结论记 `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1。**禁止**用分数调 E′。 | — | — | — | Brief `task-yin-intent-tier2-ingest.md` · §6.1 | 2026-09-01 |
