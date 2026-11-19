# tracker fragment · docs/noticing-one-line-isolation-scores

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 觉察一句分离试验真向量分数 | 纯后端/实验室 | 仅单元测试覆盖 | 本条验收的是进仓摘要 `isolationPassed:false` 与闸读 JSON，不代表四类已分开、不代表发送链已改。复跑：`FT_SEMANTIC_ACCEPTANCE_NO_DOWNLOAD=1 npm run audit:noticing-one-line-isolation`（系统终端）。 | — | — | — | [`noticing-one-line-isolation-summary.json`](../../fixtures/noticing-one-line-isolation-summary.json) | 2026-11-19 |
