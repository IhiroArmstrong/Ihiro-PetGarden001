# fix/cloud-presence-network-hint

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 访问路径 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Quiet Together + Circle · 后台 presence 网络降级 toast | UI可见 | 已通过 | **主路径（`?product=1` · Quiet Together 默认开或已加入 Circle）**：`npm run dev` 或 `npm run desktop:dev` → 断网或阻断 Worker → 硬刷新 Idle 等约 5–10s → **0–1 秒内**见底部 `MindfulAcknowledgeToast`（`CLOUD_PRESENCE_NETWORK_HINT`：全球同坐 + Circle 显示可能不可用；练习不受影响）。**同会话**：不再重复 toast。**对照**：网络恢复后 presence 成功 → 失败计数重置；Focusing 内不弹。**Electron**：走主进程 IPC，**不得**见 `[vite] http proxy error`。**自动化**：`cloudPresenceDegradedHint.test.js` · `quietTogetherPresence.test.js` · `focusCirclePresence.test.js`。 | **2026-09-25 用户书面**：`npm run dev` 断网/阻断 Worker + `desktop:dev` 双路径复测 OK — 见一次底部 toast、同会话不重复；Electron 无 Vite proxy 日志。测自 `origin/develop` tip `79fc47e5`（#968 合入后）。 | — | — | `?product=1` · `npm run dev` · `npm run desktop:dev` · PR #968 | 2026-09-25 |
