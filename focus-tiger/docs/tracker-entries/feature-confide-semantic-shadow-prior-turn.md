# Tracker fragment · feature/confide-semantic-shadow-prior-turn

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 语义影子 · 上一轮上下文对照日志 | 纯后端/逻辑 | 已通过 | **仅 Electron 宽屏**。开 Confide：先发一句情绪独白，再发「好累」。回复须与改前一致。查 `userData/companion-l2/turns.jsonl` 最近 `semantic_shadow_classify`：`text` 为「好累」，`hadPriorTurn` 为真，同时有 `semanticCoarse` 与 `semanticCoarseWithPrior`（分数不得为空）。第一句 `hadPriorTurn` 为假。Web/窄屏不测。单测：`npm run test:smoke`。**本条验收的是**对照字段有没有写上，**不代表** with-prior 已进真路由或茶句会变。 | **2026-09-21 早**：hadPriorTurn 真但 with-prior 空 → #916。**同日 PO+分析师书面关单**（`origin/develop` tip `31b52438`）：下午 jsonl 字段有值。关单覆盖分工 · 自动化：`confideSemanticShadowPriorTurn.test.js` · 人工：Electron 两句对照 jsonl 字段非空 · 未测：无 | — | — | `feature/confide-semantic-shadow-prior-turn` | 2026-09-20 |
