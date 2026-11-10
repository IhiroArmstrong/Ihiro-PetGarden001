# feature/t93-email-sign-in-d2

| 云端练习备份 Worker 默认允许发验证码（T93 D2） | 纯后端 | 仅单元测试覆盖 | **无界面。** 本条验收的是：缺环境变量时 `request-otp` 等五条路由不再写死 410；设 `PRACTICE_BACKUP_WRITES_DISABLED=true` 仍 410；客户端 `practiceBackupCloudEnabled` 仍为 false；菜单登录行仍灰。不代表生产已部署，也不代表用户能点登录。单测：`cd cloud && npm test` 中 `practiceBackupWritesDisabled.test.ts`；客户端 `practiceBackupCloudHttp.test.js`。 | — | — | — | `cloud/src/lib/practiceBackupWritesDisabled.ts` | 2026-11-10 |
