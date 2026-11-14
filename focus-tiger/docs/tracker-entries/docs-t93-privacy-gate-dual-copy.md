# Tracker shard · docs/t93-privacy-gate-dual-copy

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 首包 Privacy §4 双态文案 | UI文案 | 待人工测试 | **关闸包（dist `practiceBackupCloudEnabled=!1`）：** ? → Privacy → §4 须写不提供云备份 / 不承诺填邮箱找回；**不得**出现「可选用邮箱保存」。**开闸 dev：** 同屏 §4 须写可选邮箱快照、明文、可删云。en/ja 各一遍。自动化：`privacyNoticeCopy.test.js` §4 gate test。 | — | — | — | `http://127.0.0.1:5173/?product=1` · `#onboarding-privacy-sheet` | 2026-11-14 |