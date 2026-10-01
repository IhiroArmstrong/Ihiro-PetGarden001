# Tracker fragment · fix/confide-pending-reply-watchdog

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide Thinking 顶层超时 + 胶囊不挤文案 | UI/交互 | 已通过 | **Electron 宽屏**。1）冷启动、状态条仍在准备时发「我感觉心情不太好。不知是否应该练习。」→ 须在约 45 秒内出现回复（语料兜底也可），**禁止**无限 Thinking。2）等**主聊天**就绪（见 `Model4E4`；**无**「向量就绪」状态条）后再发同句，同样不得卡死。3）Thinking 胶囊可轻浮，但**不得**左右拉宽顶到「What Yin remembers」。对照：`docs/confide-embedding-lifecycle-arbitration.md`。单测：`confidePendingReplyWatchdog.test.js` | **2026-09-21 PO**（合入 #912 后桌面壳）：45 秒内出句、胶囊不挤右边文案。**备注（关单必读）**：当前「很久 Thinking → 45 秒后 corpus 兜底」**不是**「少数情况下的可接受延迟、功能是好的」；是 #908 起渲染进程 `applyConfideStage2Route` 因 `process is not defined` **每条消息都炸**，Stage 2 路由决定从未真正执行。#912 只关「无限卡死 + 胶囊布局」。语义切真是否跑通 → 见 `fix-confide-stage2-browser-env`。覆盖分工：自动化=`confidePendingReplyWatchdog.test.js`（45s 契约）；人工=合入后 45s 出句 + 胶囊不挤。 | release-blocker | 本 PR 止血（45s 看门狗 + ensure 超时）；统一 embedding 闸另 Brief；Stage 2 渲染崩溃另修 | `fix/confide-pending-reply-watchdog` | 2026-09-21 |
