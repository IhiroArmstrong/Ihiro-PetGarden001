# fix/practice-import-refresh

> 列约定与 `TEST_TRACKER.md` 主表一致。本碎片覆盖导入后刷新缺口（P0）与覆盖确认文案补强（P1）。旧碎片 `feature-local-export-import-hide-cloud-backup.md` 仅打语义补丁，不整表覆盖。

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 导入后 Journey / 热力图 / 窄屏抽屉刷新 | UI可见 | 待人工测试 | **宽屏**：打开 Journey Log 保持不关 → `?` → Privacy → 导入另一份快照 → **不关 Journey** 确认列表已换成文件内容。Idle 热力图格子同步变化。**窄屏 375**：打开抽屉看到一周格 → 保持抽屉开着完成导入 → 抽屉内克隆格与主热力图一致（不必关抽屉重开）。关抽屉再开也应仍是新数据。自动化：`practiceBackupLocalIo.test.js`（subscribe/getItem spy）+ `JourneyLogUI.test.js` / `WeeklyPracticeHeatmap.test.js` / `NarrowIdleShell.test.js` 接线锁。 | 开发自查（Cursor review）发现刷新事件无订阅，非用户上报 | — | — | `#privacy-local-data-mount` · `#journey-log` · `#weekly-practice-heatmap` · `.ft-narrow-sheet__heatmap` | 2026-08-31 |
| 覆盖确认标题/说明/多于本机 info/`savedAt` | UI可见 | 待人工测试 | 本机非空导入：对比表上方见 ⚠ +「导入将覆盖本机数据」+ 不可撤销说明。表内最后一行「最后保存于」为「今天 HH:mm」或 `YYYY-MM-DD HH:mm`（非原始 ISO）。导入件数多于本机时出现中性 info 条（非警示黄）。勾选前确认钮仍禁用。 | — | — | — | `#privacy-local-data-mount` | 2026-08-31 |
