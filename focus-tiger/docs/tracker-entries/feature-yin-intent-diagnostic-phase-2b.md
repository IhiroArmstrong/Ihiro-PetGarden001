# feature/yin-intent-diagnostic-phase-2b

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin Intent Diagnostic Phase 2B（v4 金标 + A/C/D Metal） | 纯后端/桌面 | 仅单元测试覆盖 | **无产品 UI。** 不改 Confide send / 默认 GGUF。单测：`confideIntentDiagnostic.test.js`。Metal **已完成 2026-09-01**（A/C/D 各一次 · JSON `/tmp/ft-l0-lab/intent-diag-1788231569140.json` 等 · reading=`architecture_none_pass_d_boundary_collapse_c_partial_other_lift` · 详见 `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1）。**待跑**：hard-5 第四刀 `FT_INTENT_PHASE=2b-hard5 FT_INTENT_ARCH=E`（本旁支未合）。 | — | — | — | §6.1 · `confideIntentDiagnosticPhase2b.js` | 2026-09-01 |
