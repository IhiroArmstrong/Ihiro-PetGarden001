# fix/help-center-ask-answer-tts

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| 帮助中心问卡朗读最接近答案 | UI可见 | 待人工测试 | **本条验收的是**宽屏电脑版问卡检索后听到第一篇标题+正文，**不代表**网页/窄屏也会出声，**不代表**从目录点开主题会自动念。**终端已覆盖：** `helpCenterAskSpeak.test.js` 锁第一篇、空态、T92、关卡 `stopSystemTts`；`HelpCenterUI.test.js` 锁接线。`cd focus-tiger && node --test src/core/helpCenterAskSpeak.test.js src/ui/HelpCenterUI.test.js && npm run test:smoke`。**人只补（Mac Electron 宽屏）：** ① 问 `How do I back up my data?` → 见卡后 0–1s 内开始念第一篇说明；② 无关句听到空态句；③ 关卡立刻停；④ 办理 `Back up now` 仍是确认句、不要空态朗读叠上去。Web / 窄屏只看卡、不念。 | — | — | — | `?product=1` · `[data-testid=help-center]` · Brief [task-help-center-ask-answer-tts.md](../task-briefs/task-help-center-ask-answer-tts.md) | 2026-11-14 |
