# Tracker fragment · feature/confide-semantic-routing-shadow

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 语义向量影子分流（Stage 1 · 不改回复） | 纯后端/逻辑 | 待人工测试 | Electron 宽屏 Confide：发「累积了多久」「忙啥」「太累了」各一句；确认**回复文案与改前一致**；查 `userData/companion-l2/turns.jsonl` 是否新增 `kind:semantic_shadow_classify` 且含 `text` / `literalCoarse` / `semanticCoarse`。单测：`npm run test:smoke` | — | — | — | `feature/confide-semantic-routing-shadow` | 2026-09-19 |
