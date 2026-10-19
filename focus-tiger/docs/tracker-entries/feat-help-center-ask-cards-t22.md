# Tracker · T22 Help Center 问卡

| T22 Help Center 问卡（产品问目的地） | UI可见 | 待人工测试 | **主路径**：`?product=1` → ⋯ → Help Center → 顶部问卡框打字或 Speak to type（字进框可改）→ Search → 0–1 秒内见 2–3 张可点卡或「没有合适的卡」/「No matching topics」；点卡进正文；下方主题目录仍在。**祈使句**：`Back up now` 不得执行备份，应列备份相关卡或空态。**低配**：embedding 未就绪时仍可用关键词（如 `How do I back up my data?`）。**语音**：停录后字在框内，不自动检索；窄屏无麦。**不测**：倾诉发送链、T23 跳转、#1339 念卡是否还在。自动化：`helpCenterAskSearch.test.js` · `HelpCenterUI.test.js` · `npm run test:smoke`。 | — | — | — | `helpCenterAskSearch.js` · `HelpCenterUI.js` · `help-center.json` | 2026-10-19 |
