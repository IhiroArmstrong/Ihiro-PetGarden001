# TEST_TRACKER 碎片 · fix/confide-embedding-shadow-status-strip (Prompt 10 · Confide 语义线)

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 相关文件 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide embedding 冷启动不污染状态条（Prompt 10） | UI可见 | 待人工测试 | **代码已合 develop · #872（与 Prompt 7 同 PR）· 待 PO 手测。** **≠** Membership Prompt 10（#240）。**主路径**：Electron 宽屏 Confide，主 GGUF 已 ready；首句触发 Qwen3-Embedding 下载/加载时，状态条**不得**误显「Downloading…」或假进度（`l1Status` 忽略 `embedding_downloading` / `embedding_loading`）。**对照**：主模型真下载时仍正常显示 downloading。**回流**：embedding ready 后 shadow 正常写入。单测：`desktopCompanionL1.test.js`「ignores shadow embedding phases」 | — | — | — | `l1Status.js` · `l1Child.js` · PR #872 | 2026-09-20 |
