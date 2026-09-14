# feature/electron-desktop-updater-mvp

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| Electron 官网 DMG 自动更新器 MVP | UI可见 | 待人工测试 | **仅 Electron 壳**。**B · DEV 假通路**：`npm run desktop:dev` → `?product=1&forceDesktopUpdate=1` → Idle 左下见更新芯片 → 点一下 → 0–1s 内见「Downloading…」→ 再变「Restart to install」；**禁止**整页 reload。**失败态**：主进程 IPC `fakeState({ phase: 'failed' })` 或 Brief 脚本 → 芯片见 Retry + Not now，两点均有反馈。**忙时**：Focus/Arrival/Reflection 中芯片隐藏，Rise 后再显；ready 时若仍忙不得重启。**渠道**：`FT_UPDATE_CHANNEL=setapp|mas` 编译期关自建更新（单测锁）。**C/D**：本地 generic feed + 公证彩排仍待发布周。单测：`desktopUpdaterChannel.test.js` · `desktopUpdaterState.test.js`。 | — | — | — | `npm run desktop:dev` · `?forceDesktopUpdate=1` · `#ft-soft-update-prompt` | 2026-09-14 |
