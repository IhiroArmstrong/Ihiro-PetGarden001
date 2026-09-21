# Tracker fragment · fix/confide-semantic-live-prior-cache

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 语义 live 取上一轮 + 影子不吃不完整缓存 | 纯后端/逻辑 | 待人工测试 | **仅 Electron 宽屏**（测桌面壳，勿与 5173 QA 网页混用）。先发一句情绪独白，再发「好累」。界面回复应与改前同类（本修不改 Stage 2 路由）。查 `userData/companion-l2/turns.jsonl`：第一句 `semantic_shadow_classify` 的 `hadPriorTurn` 为假；第二句 `text` 为「好累」、`hadPriorTurn` 为真，且 `semanticCoarseWithPrior` / `scoreAWithPrior` / `scoreBWithPrior` **非空**（两栏可相同，但不得再是 null）。关面板再开再发两句复核。Web/窄屏不测。单测：`npm run test:smoke` | — | — | — | `fix/confide-semantic-live-prior-cache` | 2026-09-21 |
