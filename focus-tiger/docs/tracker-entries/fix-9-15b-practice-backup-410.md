# tracker fragment · fix/practice-backup-410-all-routes

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 9-15b 备份路由全 410 | 纯后端 | 仅单元测试覆盖 | **无界面。** 申请验证码 / 校验 / 写入 / 读取 / 删除 在写入关闭时一律 410 `practice_backup_disabled`。现网要等生产 Worker 再部署才生效。单测：`cd cloud && npm test` 中 `practiceBackupWritesDisabled.test.ts`。 | PO 2026-11-08：9-15 只闸了发验证码 | — | — | `cloud/src/index.ts` | 2026-11-08 |
