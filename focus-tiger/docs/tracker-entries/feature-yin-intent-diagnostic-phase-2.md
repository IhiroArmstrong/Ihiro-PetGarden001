# feature/yin-intent-diagnostic-phase-2

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin Intent Diagnostic Phase 2（设计师 20 条） | 纯后端/桌面 | 仅单元测试覆盖 | **无产品 UI。** 不改 Confide send / L3 persona / 默认 GGUF。自动化：`confideIntentDiagnostic.test.js`（12+20=32 · #1 `maybe-later-talk` secondary 空）。实验室（须本机 1.7B · 系统终端 Metal）：`cd focus-tiger/desktop && FT_INTENT_PHASE=2 npm run companion:intent-diagnostic` → `/tmp/ft-l0-lab/intent-diag-*.json`。全量 32 条可省略 `FT_INTENT_PHASE`。结论只拆模型 vs routing，禁止据此换模型。 | — | — | — | `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1 · `confideIntentDiagnosticFixtures.js` | 2026-09-01 |
