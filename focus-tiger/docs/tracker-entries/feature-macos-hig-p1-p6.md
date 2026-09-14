# feature/macos-hig-p1-p6

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| macOS ⌘+, 打开 Preferences（桌面） | UI可见 | 待人工测试 | **仅 Electron 壳**：`npm run desktop:dev` → Idle 主屏按 **⌘+,** → 0–1s 内弹出与 ⋯ → Preferences 分组**首项**相同的面板（常见为提醒或语言设置）。关闭后再按 ⌘+, 行为一致。隐藏到托盘后按 ⌘+, 窗口应恢复并打开同一面板。单测：`desktopPreferencesShortcut.test.js` · `desktopPackaging.test.js`。 | — | — | — | `npm run desktop:dev` | 2026-09-14 |
