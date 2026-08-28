# feature/local-export-import-hide-cloud-backup

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 完整隐私声明 + 本地导出/导入；云端备份隐藏 | UI可见 | 待人工测试 | **`?product=1` · 入口**：Idle → **?** → **Privacy** → 见「完整隐私声明」导语 + **§1–§5 标题**（与 `PRIVACY_NOTICE.md` 对齐）→ §3 下 **导出数据 / 导入数据**。**导出闭环**：有 Journey/练习日后导出 `.json` → DEV 清 6 whitelist key（或重置）→ 导入同一文件 → Journey Log / 热力图恢复。**覆盖确认**：本机非空导入须勾选「我已了解…」后确认按钮才可点；文件某类少于本机时出现警示条。**云端残留**：Journey Log **无**绑定邮箱/云端备份链；Network 面板全程 **无** `/api/practice-backup/*`（含曾 opt-in、`focus-tiger.practice-backup.v1` 仍 enabled 的本地状态）。**Boot**：清 6 key 保留 opt-in → 硬刷新 → **约 2.5s 内不自动**从云端恢复（仅本机空库也不拉取）。**375**：同路径窄屏可滚动读完 §1–§5。自动化：`practiceBackupLocalIo.test.js` · `practiceBackupSync.test.js`（`cloud_disabled`）· `privacyNoticeCopy.test.js`。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#onboarding-privacy-sheet` · `#privacy-local-data-mount` | 2026-08-28 |
