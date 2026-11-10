# feature/t93-email-sign-in-d1

| 云端练习备份恢复改为并集去重（T93 D1） | 纯后端 | 仅单元测试覆盖 | **无界面。** 本条验收的是：`writePracticeBackupCloudStoresRaw` 对白名单 key 做并集、云端 null 不删本地、阶段下限仍取较高、`practiceBackupCloudEnabled` 仍为 false。不代表菜单登录已可点，也不代表云闸已开。单测：`practiceBackupCloudMerge.test.js` + `practiceBackupSnapshot.test.js` 云恢复并集用例。 | — | — | — | `src/core/practiceBackup/` | 2026-11-10 |
