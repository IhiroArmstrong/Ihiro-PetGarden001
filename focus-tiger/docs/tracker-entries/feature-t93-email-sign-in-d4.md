# tracker fragment · feature/t93-email-sign-in-d4

| 坐完提示 / 空库从邮箱恢复（T93 D4） | UI可见 | 待人工测试 | **网页：**完成一次坐禅回到 Idle 后，应出现轻提示「如果这台设备忘了…」；点保存 0–1s 打开邮箱卡；点「先不用」永久不再出。付款卡或研究坐完提示开着时不出。无倒计时。**电脑空库：**第一幕关掉后，底部可见「从邮箱恢复」，点开同一张卡；第一幕还在时不准出。商店渠道不出。自动化：`emailJourneySitCompletePrompt.test.js` · `emailJourneyEmptyLibrary.test.js` · overlay 让路单测。人工补：真邮件发码（生产 Worker 已部署）。 | — | — | — | `npm run dev` · `[data-testid=email-journey-sit-complete-prompt]` · `[data-testid=email-journey-empty-library-chip]` | 2026-11-11 |
