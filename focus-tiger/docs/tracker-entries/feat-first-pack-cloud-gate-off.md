# Tracker shard · feat/first-pack-cloud-gate-off

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 首包关闭邮箱云端找回闸 | UI可见 | 待人工测试 | **主路径：** 设置里不应再看到可点的「用邮箱保存或找回」；Privacy 云备份段写「当前未提供」。**回流：** 本地导出/导入仍可打开。自动化：`practiceBackupCloudEnabled === false` 单测 + `npm run build:verify-cloud-gate`；反向：源码默认 `true` 或 dist `practiceBackupCloudEnabled=!0` 必须失败。 | — | — | — | `npm run dev` · 设置 / Privacy | 2026-11-12 |
