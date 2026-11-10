# tracker fragment · feature/t93-email-sign-in-d3

| 用邮箱保存或找回旅程（T93 D3） | UI可见 | 待人工测试 | **网页 + 官网桌面。** ⋯ 或抽屉 → 设置 →「用邮箱保存或找回」→ **0–1 秒内**见玻璃卡。发码立刻见「发送中…」，成功见已发说明；Worker 仍关时见「云端暂时不可用」，禁止没反应。验证成功见已合并句。登出清本机令牌；删云须再填验证码。商店渠道该行不可点。Journey 角落不得再出现备份链。不测坐完提示（那是下一刀）。单测：`emailJourneyRestoreStatus.test.js` · `EmailJourneyRestorePanelUI.test.js` · 菜单可达 `account` 开卡。 | — | — | — | `npm run dev` · `#email-journey-restore-panel` · `[data-testid=idle-account-email-restore]` | 2026-11-10 |
