# Tracker fragment · fix/companion-reuse-packaged-gguf

| 功能 | 类型 | 状态 | 测试步骤（含本地访问路径） | 用户反馈 | 严重度 | 处理承诺 | 涉及模块 | 完成日期 |
|---|---|---|---|---|---|---|---|---|
| Electron 开发壳复用已装好的 Gemma GGUF，不误开第二段下载 | 用户可感知 | 待人工测试 | **须完全退出再开 Electron**（托盘隐藏不算）。确认 `~/Library/Application Support/Focus Tiger/companion-l0/Gemma-4-E4B-it-Q4_K_M.gguf` 约 5.0GB 完整。用日常 `desktop:dev`（userData 常为 `focus-tiger-desktop`）开宽屏 Confide：应见「読み込んでいます…」，**不得**再出现「ダウンロードしています…」+ 慢绿条。ready 前发「小可耐喜欢吃啥?」应得 corpus 茶句且伝える可点；ready 后 `data-source=generate`。单测：`node --test src/core/desktopCompanionL0Download.test.js src/core/desktopCompanionL1.test.js` | PO 2026-09-16：#797 合入后仍见下载条；答复像茶句不是生成 | — | — | `l0Download.js` · `l1Runtime.js` · `l1Child.js` | 2026-09-16 |
