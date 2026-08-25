# fix/practice-backup-daily-completion-reconcile

| 练习备份恢复后提醒与热力图对齐（方案 A） | UI可见 | 待人工测试 | **主路径**：开启练习备份 → 完成一场同坐（或 Honesty）→ 等 `lastUploadAt` 更新 → DEV 清 6 whitelist key（保留 `practice-backup.v1`）→ 硬刷新 → 约 2.5s 后自动恢复。**期望**：热力图今日格亮 + 提醒设置面板出 `reminder.practiced_today_note`（今天不会再提醒）、顶部横幅不出。**边界**：恢复日无 `practice-days` 今日条目 → 仍催练；已有本地 `daily-completions` 不被覆盖。自动化：`practiceBackupDailyCompletionReconcile.test.js` · `practiceBackupSync.test.js`。 | — | — | — | `TODAY_PRACTICE_SEMANTICS_AUDIT.md` §9.1 方案 A | 2026-08-26 |
