# Tracker fragment · feature/confide-semantic-shadow-prior-turn

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 语义影子 · 上一轮上下文对照日志 | 纯后端/逻辑 | 待人工测试 | **仅 Electron 宽屏**。开 Confide：先发一句情绪独白，再发「好累」。回复须与改前一致。查 `userData/companion-l2/turns.jsonl` 最近 `semantic_shadow_classify`：`text` 为「好累」，`hadPriorTurn` 为真，同时有 `semanticCoarse` 与 `semanticCoarseWithPrior`。第一句 `hadPriorTurn` 为假。Web/窄屏不测。单测：`npm run test:smoke` | — | — | — | `feature/confide-semantic-shadow-prior-turn` | 2026-09-20 |
