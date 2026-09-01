# feature/yin-intent-hard5-fourth-cut

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Yin Intent Diagnostic hard-5 第四刀（架构 E） | 纯后端/桌面 | 待人工测试 | **无产品 UI。** 不改 Confide send / 默认 GGUF。单测：`confideIntentDiagnostic.test.js`（含 E prompt · hard5 gates）。实验室（须本机 1.7B · 系统终端 Metal · 跑一次）：`cd focus-tiger/desktop && FT_INTENT_PHASE=2b-hard5 FT_INTENT_ARCH=E npm run companion:intent-diagnostic` → `/tmp/ft-l0-lab/intent-diag-*.json` 的 `hard5Gates` 与 `reading`。只评 B7/B11/B13/B17/B19。 | — | — | — | §6.1 · `confideIntentDiagnosticPhase2b.js` | 2026-09-01 |
