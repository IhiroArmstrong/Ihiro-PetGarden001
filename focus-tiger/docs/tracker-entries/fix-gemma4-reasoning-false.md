# Tracker fragment · fix/gemma4-reasoning-false

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Gemma4 关思考模式（修空 generate） | 纯后端/桌面 | 待人工测试 | **Electron 宽屏 Confide**（默认 Gemma4-E4B）。ready 后空会话发 5 条 #774 差样本（中/日/英各至少 1 条）：`data-source=generate`，**不得**因空 `rawGenerate` 整段回落茶句。连发 2 句不得 `No sequences left`。系统终端 A/B 已跑（`reasoning:false`）：jc 75/75 generate · un 75/75 generate · 见 `/tmp/ft-l0-lab/gemma4-quant-ab-summary-reasoning-false.json`。单测：`node --test src/core/l1ChatSequence.test.js src/core/desktopCompanionL2Route.test.js` | PO 2026-09-17：上轮 unsloth 0/75 为默认思考模式未读 thought 段；修配置后须重跑完整 A/B | — | — | `fix/gemma4-reasoning-false` | 2026-09-17 |
