# feat-g2-fact-rank-margin-diag

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Confide G2 正确卡排名余量诊断（T14） | 纯后端/实验室 | 仅单元测试覆盖 | **无用户路径。** 本条验收的是：作废 v1/v2 回放 + 可见开发集只报数字；`node --test src/core/confide/confideG2FactRankMargin.test.js`；真 embedding `npm run audit:g2-fact-rank-margin` 的 JSON 在仓外 `~/Documents/ft-private/confide-g2-fact-rank-margin-lab/`。不代表发送链已改，也不代表 G2 过关。禁止原句进仓。不新增封存批。 | — | — | 诊断结论写入本支任务片，不据此默默改 0.80 | `audit:g2-fact-rank-margin` · `confideG2FactRankMargin.test.js` | 2026-10-17 |
