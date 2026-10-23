# Tracker · T34 Help Center 问卡办理

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问 | 日期 |
|---|---|---|---|---|---|---|---|---|
| T34 Help Center 问卡办理 | UI可见 | 待人工测试 | **终端已覆盖：** 疑问句 `How do I back up my data?` 不办理、列备份卡；`Back up now` / `Hi Yin, please backup…` 为 B 档且 `execute: false`；危机句 `shouldExecute` 假；Confide 无称呼 `Back up now` 仍倾诉。`cd focus-tiger && node --test src/core/helpCenterAskSearch.test.js src/core/yinVoiceCommandEntry.test.js src/ui/HelpCenterUI.test.js && npm run test:smoke`；e2e `npm run test:e2e:changed -- e2e/help-center-operating.spec.js`。**人只补（Mac Electron 宽屏）：** ① 问卡提交 `Back up now` 0–1s 内见复述 + Yes/Cancel，点 Cancel 不写出备份；② `How do I back up my data?` 仍出备份卡；③ `Hi Yin, please backup…` 确认后才备份。窄屏只测键盘提交列卡。不测倾诉发送链。 | — | — | — | `?product=1` · Help Center 问卡 · Brief [task-help-center-operating-commands.md](../task-briefs/task-help-center-operating-commands.md) | 2026-10-22 |
