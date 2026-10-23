# feature/t51-awaken-invite-orchestrator

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问路径 | 最后更新日期 |
|---|---|---|---|---|---|---|---|---|
| T51 觉照邀请编排 | UI可见 | 待人工测试 | **主路径**：`?product=1&sessionMinutes=1` → Here & Now Focusing → Console `window.__awakenInvite.showPause()` → 0–1s 见 `#awaken-invite` 观察式短问（无焦虑/分数词）→ 点 **要** → 现网接地练习出现；点 **先不用** 或等 10s → 邀请淡出（**SB-20**）。**对照**：Flow State Focusing → `window.__awakenInvite.offerAway()` → **无**邀请（**SB-03**）。**到点**：Flow 墙钟到点见「要再坐一会儿吗」；要 → HUD 继续 +5 分钟；Here & Now 到点不出续坐问。**回流**：邀请后 10 分钟内不再主动出。**保护面**：Re-focus toast、点阿寅 Recover、Support FAB、托盘 **SB-18**。e2e：`e2e/awaken-invite.spec.js`（Here & Now 点「要」出接地练习）。Flow / Offline 不邀约由 `InterventionOrchestrator.test.js` 锁 **SB-03**。 | — | — | — | `?product=1&sessionMinutes=1` · `#awaken-invite` | 2026-10-23 |
