# Tracker fragment · fix/confide-pending-reply-watchdog

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide Thinking 顶层超时 + 胶囊不挤文案 | UI/交互 | 待人工测试 | **Electron 宽屏**。1）冷启动、状态条仍在准备时发「我感觉心情不太好。不知是否应该练习。」→ 须在约 45 秒内出现回复（语料兜底也可），**禁止**无限 Thinking。2）等聊天就绪后再发同句，同样不得卡死。3）Thinking 胶囊可轻浮，但**不得**左右拉宽顶到「What Yin remembers」。对照：`docs/confide-embedding-lifecycle-arbitration.md`。单测：`confidePendingReplyWatchdog.test.js` | 2026-09-21 用户：长情绪独白后无休止 Thinking，胶囊向右伸缩顶文案 | release-blocker | 本 PR 止血（45s 看门狗 + ensure 超时）；统一 embedding 闸另 Brief | `fix/confide-pending-reply-watchdog` | 2026-09-21 |
