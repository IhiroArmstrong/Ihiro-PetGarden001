# tracker fragment · fix/confide-open-blocked-feedback

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Plan A 死路 · 倾诉不能开时仍见 T92 求助句 | UI可见 | 待人工测试 | **主路径**：Web/Electron、**无** `?confide=1`、未购陪伴宽屏（或 mount off）→ 沉思问询 →「想聊聊」→ **0–1 秒** `#mindful-acknowledge-toast[data-testid=confide-open-blocked-safety-help]` 含本地求助热线句；**不得**无声。**回流**：toast 消失后再点仍出。**自动化**：`confideOpenBlockedFeedback.test.js` · `confideOpenEntryRegistry.test.js` · `npm run test:smoke`。语音危机转倾诉、帮助中心危机链见 `fix-plan-a-t92-voice-help-behavior.md`。 | PO 2026-11-09 · T98 死路 | — | — | `confideOpenBlockedFeedback.js` · `ConfideToYinUI.open` · `main.js` onOpenBlocked | 2026-11-09 |
