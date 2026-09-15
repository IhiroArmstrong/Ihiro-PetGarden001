# Tracker fragment · feature/confide-ja-chitchat-variance-probe

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| #774 日语闲聊方差统计探针（实验室脚本） | 仅单元测试覆盖 | 待人工测试 | **不在 Cursor 跑**；须系统终端.app + Metal + 生产 GGUF。`cd focus-tiger && npm run sync:qa-develop` 后：`cd focus-tiger/desktop && FT_CHITCHAT_RUNS=15 npm run companion:ja-chitchat-variance`。验收：输出 `/tmp/ft-l0-lab/compare-<epoch>.json`，5 条样本 × 15 次，字段含 `route` / `data-source` / `corpusId` / `replyText` / `onTopic: null`。单测：`node --test src/core/confide/confideJaChitchatVarianceFixtures.test.js` | — | — | — | `feature/confide-ja-chitchat-variance-probe` | 2026-09-16 |
