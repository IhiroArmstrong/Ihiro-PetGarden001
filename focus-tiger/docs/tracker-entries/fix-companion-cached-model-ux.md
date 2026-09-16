# Tracker fragment · fix/companion-cached-model-ux

| 功能 | 类型 | 状态 | 测试步骤 | 用户反馈 | 严重度 | 处理承诺 | 分支 | 日期 |
|---|---|---|---|---|---|---|---|---|
| Confide 已缓存 GGUF 不误显「下载中」；载入中可发茶句 | 用户可感知 | 待人工测试 | **Electron 宽屏**，Gemma4-E4B 已完整落盘（`~/Library/Application Support/Focus Tiger/companion-l0/Gemma-4-E4B-it-Q4_K_M.gguf`）。开 Confide：**不得**再见「ローカルモデルをダウンロードしています…」+ 假进度条；应见「読み込んでいます…」直至 ready。ready 前输入中文句回车：**伝える**不得灰死；应得 corpus 茶句或等 ready 后 generate。ready 后连发探针仍按 `feature-companion-hold-sequence-recycle` 验收。单测：`node --test src/core/desktopCompanionL0Download.test.js src/core/desktopCompanionL1.test.js src/core/confide/confideReadHybrid.test.js` | PO 2026-09-16：已装 Gemma4E4 仍显示慢速下载条；回车后伝える灰掉无反应 | — | — | `l1Child.js` · `l0Download.js` · `ConfideToYinUI.js` | 2026-09-16 |
