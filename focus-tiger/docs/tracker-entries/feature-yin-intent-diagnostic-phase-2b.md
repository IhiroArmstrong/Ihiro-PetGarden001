# feature/yin-intent-diagnostic-phase-2b

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin Intent Diagnostic Phase 2B（v4 金标 + A/C/D） | 纯后端/桌面 | 仅单元测试覆盖 | **无产品 UI。** 不改 Confide send / L3 persona / 默认 GGUF。自动化：`confideIntentDiagnostic.test.js`（v4 分母 8/8/8/6 · A2=COMPANION · 砍 B14/B15/B18）。实验室（须本机 1.7B · 系统终端 Metal · 各跑一次）：`cd focus-tiger/desktop && FT_INTENT_PHASE=2b FT_INTENT_ARCH=A npm run companion:intent-diagnostic`（再把 `ARCH` 换成 `C`、`D`）→ `/tmp/ft-l0-lab/intent-diag-*.json` 里的 `phase2bGates`。🔁 holdout 用 `FT_INTENT_HOLDOUT=1`，禁止拿去调 C。结论只拆架构 vs 容量，禁止据此换模型。 | — | — | — | `LOCAL_AI_PHASE1_TASK_PLAN.md` §6.1 · `confideIntentDiagnosticPhase2b.js` | 2026-09-01 |
