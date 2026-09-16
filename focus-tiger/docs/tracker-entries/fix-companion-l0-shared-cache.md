# Tracker fragment · fix/companion-l0-shared-cache

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Electron Confide 与探针共用 Focus Tiger GGUF 目录 | 用户可感知 | 待人工测试 | **先退出**正在下到 `focus-tiger-desktop/companion-l0/` 的 Electron。宽屏 Electron 开坦白：已有 `~/Library/Application Support/Focus Tiger/companion-l0/Gemma-4-E4B-it-Q4_K_M.gguf` 时，应变「読み込んでいます…」，**不得**再出现「ダウンロード」+ 进度条。ready 前发「小可耐喜欢吃胖粉吗？」应立刻茶句。单测：`node --test src/core/desktopCompanionL1.test.js`。 | PO 2026-09-16：#797 合入后探针目录已有 5GB 模型，Electron 仍显示下载（实际写在 `focus-tiger-desktop` 的 `.part`） | — | — | `l0ModelDir.js` · `l1Runtime.js` · `l1Child.js` | 2026-09-17 |
