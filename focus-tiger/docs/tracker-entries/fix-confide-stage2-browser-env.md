# Tracker fragment · fix/confide-stage2-browser-env

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide Stage 2 渲染进程不得因 process.env 崩路由 | UI/交互 | 待人工测试 | **仅 Electron 宽屏**。DevTools 开着发情绪独白（如「俺觉得不太高兴。不想练习。」）。**主路径**：0–1 秒内可见 Thinking；**禁止** `applyConfideStage2Route` / `process is not defined`；须在远短于 45s 内出句（generate 或语义改路由均可），不得再靠看门狗 corpus。**回流**：关面板再开，再发一句，同样无该报错。对照：`docs/confide-embedding-lifecycle-arbitration.md`。单测：`confideSemanticStage2.test.js`「process is missing」。Web / 窄屏不测。 | 2026-09-21 PO DevTools：`confideSemanticStage2.js:51 Uncaught (in promise) ReferenceError: process is not defined` → 很久 Thinking → `consecutive generate fallback` + `dataSource: corpus`。 | release-blocker | 本 PR：浏览器安全 env；不改 Stage 2 路由表 | `fix/confide-stage2-browser-env` | 2026-09-21 |
