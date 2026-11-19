# tracker fragment · feature/noticing-release-no-generate-g1

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| G1 发布构建走不到生成 | 纯后端 | 仅单元测试覆盖 | 本条验收的是结构检查：登记表倾诉可见行 `releaseReach=no`、用户路径闸恒 false、打包会跑检查。不代表句库已审、不代表窄窗发送钮。`cd focus-tiger && npm run check:generation-gate` 须含 `release-no-generate=ok` 且 `drift=0`。不测界面。 | — | — | — | Brief [`task-noticing-no-generate-invariant.md`](../task-briefs/task-noticing-no-generate-invariant.md) 在 #1784；本刀只接线检查 | 2026-11-19 |
