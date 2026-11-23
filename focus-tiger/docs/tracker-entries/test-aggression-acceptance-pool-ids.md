# tracker fragment · test/aggression-acceptance-pool-ids

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 攻击冻表可见句锁专用池 id | 纯后端 | 仅单元测试覆盖 | **无界面。** `node --test src/core/confide/confideAggressionAcceptanceFixtures.test.js src/core/confide/confideAcceptanceEvaluate.test.js src/core/noticingOneLine/noticingOpenGateNfFixtures.test.js`：12 条伤害他人句 `replyId` 为 `aggression-01`–`04`；不得 `A-`/`B-`；`shouldUseNoticingFixedLine` 为假。不点 App。不代表 12/5 已签发。 | — | — | — | Brief 恢复专用池 §5 · #1869 后夹具补洞 | 2026-11-23 |
