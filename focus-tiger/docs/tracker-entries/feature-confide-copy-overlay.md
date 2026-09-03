# feature-confide-copy-overlay

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 本地访问 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 句库 overlay（`/api/confide-copy`） | 纯后端 + UI文案 | 待人工测试 | **主路径（`?product=1&confide=1` · 配 `VITE_CLOUD_API_BASE_URL`）**：硬刷新后 `__tasteLayer.status()` 含 `confideCopy: true`（可在欢迎/首段 Idle 之后）。Idle → ⋯ → Confide → **0–1 秒内**卡淡入；发一句情绪桶（如 tired）→ **0–1 秒内**回复出现，`data-source` 仍为现网 id（retrieve），句文与本地冻表一致（冻表相同则不另存 overlay）。**对照**：`?tasteLayer=0` → `confideCopy: false`，Send 仍正常。**慢网**：失败不得挡 Sit / Send。**回流**：关卡再开发送；boundary / stay-here / preference 诚实空态仍走本机路由，只可能换字。**禁止**：Send 出现「正在下云端句库」；上传原文。自动化：`tasteLayerOverlay.test.js` · `tasteLayerSync.test.js` · `confideCorpus.test.js` · `confideBoundaryRespect.test.js`。**完整用户链路无 e2e**（须人工）。 | — | — | — | `feature/confide-copy-overlay` · Worker 源码有、生产须「部署」 | 2026-09-03 |
