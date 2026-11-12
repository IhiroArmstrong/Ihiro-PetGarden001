# Tracker shard · docs/t95-update-feed-domain

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问 | 日期 |
|---|---|---|---|---|---|---|---|---|
| 隐私声明写明电脑版检查更新会露出 IP 和版本 | UI可见 | 待人工测试 | **主路径：** Idle → ? → Privacy，第 2 节见到 `updates.twinsology.com` 以及 IP / 版本（中英日任一界面语言）。**回流：** 关掉 Privacy 再打开，句子仍在。自动化：`privacyNoticeCopy.test.js`、`desktopUpdateFeedUrl.test.js`（声明缺主机则红）。 | PO 2026-11-12 拍板该域名 | — | — | `?product=1` · `#onboarding-privacy-sheet` | 2026-11-12 |
