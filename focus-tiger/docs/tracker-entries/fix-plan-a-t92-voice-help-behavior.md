# tracker fragment · fix/plan-a-t92-voice-help-behavior

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 备注 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Plan A §6 · 语音危机转倾诉（挂载关） | UI可见 | 待人工测试 | **主路径**：Electron 宽屏、挂载关、无 `?confide=1` → 按住语音说危机句（如 `I don't want to live`）→ **0–1 秒** `#mindful-acknowledge-toast[data-testid=confide-open-blocked-safety-help]` 含 T92 热线句；倾诉卡不得打开；不得无声。**回流**：再按 PTT 仍出 toast。自动化：`confidePlanAHelpCenterAskSafety.test.js` · `confideOpenEntryRegistry.test.js` · `npm run test:smoke`。 | PO 2026-11-10 · 方案 A 第 6 点 | — | — | `ConfideToYinUI.submitVoiceCommandRaw` · `main.js` onOpenBlocked | 2026-11-10 |
| Plan A §6 · 帮助中心问卡危机句 T92 | UI可见 | 待人工测试 | **主路径**：`?product=1` → Help Center → 问卡输入 `I want to kill myself` → 提交 → **0–1 秒** `[data-testid=help-center-ask-safety-t92]` 含与 T92 相同求助句（中/英/日 locale）。不得只显示「无结果」空态。**回流**：再搜普通问题仍走检索。自动化：同上 + `helpCenterAskSearch.test.js`（safety 政策）。 | PO 2026-11-10 · 方案 A 第 6 点 | — | — | `HelpCenterUI.js` · `confidePlanAHelpCenterAskSafety.js` | 2026-11-10 |
